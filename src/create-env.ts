import type {
  CreateEnvOptions,
  EnvExplainEntry,
  EnvSchema,
  InferEnv,
  ValidationError,
  ValidationReport
} from "./types.js"
import { JelsyError } from "./errors.js"

const isValidationError = (err: unknown): err is ValidationError =>
  typeof err === "object" &&
  err !== null &&
  "key" in err &&
  "kind" in err &&
  "message" in err

export const createEnv = <TSchema extends EnvSchema>(
  schema: TSchema,
  options?: CreateEnvOptions
): Readonly<InferEnv<TSchema>> => {
  // 1. Resolve env source
  const envSource = (options?.env ??
    (typeof process !== "undefined" ? process.env : {}))

  // 2. Compute emptyStringAsUndefined early — needed for both nodeEnv and resolveRaw
  const emptyAsUndefined = options?.emptyStringAsUndefined ?? true

  // 3. Resolve nodeEnv (from env source, NOT process.env directly, WITHOUT prefix).
  // Uses ?? (not ||) so that explicit empty string is preserved unless emptyAsUndefined is on.
  const rawNodeEnv = envSource["NODE_ENV"]
  const nodeEnv =
    emptyAsUndefined && rawNodeEnv === "" ? undefined : (rawNodeEnv ?? undefined)

  // 4. Build resolveRaw helper (prefix + emptyStringAsUndefined)
  const resolveRaw = (key: string): string | undefined => {
    const envKey = options?.prefix ? options.prefix + key : key
    const raw = envSource[envKey]
    if (emptyAsUndefined && raw === "") return undefined
    return raw
  }

  // 5. Iterate schema keys — collect results and errors
  const result = {} as Record<string, unknown>
  const errors: Record<string, ValidationError> = {}
  const provenance: EnvExplainEntry[] = []

  const inferProvenance = (
    key: string,
    raw: string | undefined,
    parsed: unknown,
    meta: { type: string; default?: unknown; devDefault?: unknown; desc?: string }
  ): EnvExplainEntry => {
    let source: "env" | "default" | "devDefault"

    if (raw !== undefined) {
      source = "env"
    } else if (meta.devDefault !== undefined && nodeEnv !== "production") {
      source = "devDefault"
    } else {
      source = "default"
    }

    return {
      key,
      value: parsed,
      source,
      type: meta.type,
      ...(meta.desc && { desc: meta.desc })
    }
  }

  Object.keys(schema).forEach((key) => {
    const validator = schema[key]
    if (!validator) return
    const raw = resolveRaw(key)

    try {
      const parsed = validator._parse(key, raw, nodeEnv)
      result[key] = parsed
      provenance.push(inferProvenance(key, raw, parsed, validator._meta))
    } catch (err) {
      if (isValidationError(err)) {
        errors[key] = err
      } else {
        throw err
      }
    }
  })

  // 6. If errors exist, report and throw
  if (Object.keys(errors).length > 0) {
    const report: ValidationReport = { errors, env: envSource }

    // Custom reporter is for display/logging only.
    // If reporter throws, that exception propagates (JelsyError is NOT thrown).
    // If reporter returns normally, JelsyError is thrown below as a safety net.
    if (options?.reporter) {
      options.reporter(report)
    }

    throw new JelsyError(errors)
  }

  // 7. Attach explain() via Object.defineProperty BEFORE freeze
  Object.defineProperty(result, "explain", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: (): EnvExplainEntry[] =>
      provenance.map((entry) => ({ ...entry }))
  })

  // 8. Freeze and return
  Object.freeze(result)
  return result as Readonly<InferEnv<TSchema>>
}
