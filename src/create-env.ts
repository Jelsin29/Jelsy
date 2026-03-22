import type {
  CreateEnvOptions,
  EnvExplainEntry,
  EnvSchema,
  InferEnv,
  ValidationError,
  ValidationReport
} from "./types.js"
import { JelsyError } from "./errors.js"

interface ProvenanceEntry {
  key: string
  value: unknown
  source: "env" | "default" | "devDefault"
  type: string
  desc?: string
}

export const createEnv = <TSchema extends EnvSchema>(
  schema: TSchema,
  options?: CreateEnvOptions
): Readonly<InferEnv<TSchema>> => {
  // 1. Resolve env source
  const envSource = (options?.env ??
    (typeof process !== "undefined" ? process.env : {})) as Record<
    string,
    string | undefined
  >

  // 2. Resolve nodeEnv (from env source, NOT process.env directly, WITHOUT prefix)
  const nodeEnv = envSource["NODE_ENV"] || undefined

  // 3. Build resolveRaw helper
  const emptyAsUndefined = options?.emptyStringAsUndefined ?? true

  const resolveRaw = (key: string): string | undefined => {
    const envKey = options?.prefix ? options.prefix + key : key
    const raw = envSource[envKey]
    if (emptyAsUndefined && raw === "") return undefined
    return raw
  }

  // 4. Iterate schema keys — collect results and errors
  const result = {} as Record<string, unknown>
  const errors: Record<string, ValidationError> = {}
  const provenance: ProvenanceEntry[] = []

  const inferProvenance = (
    key: string,
    raw: string | undefined,
    parsed: unknown,
    meta: { type: string; default?: unknown; devDefault?: unknown; desc?: string }
  ): ProvenanceEntry => {
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
    const validator = schema[key]!
    const raw = resolveRaw(key)

    try {
      const parsed = validator._parse(key, raw, nodeEnv)
      result[key] = parsed
      provenance.push(inferProvenance(key, raw, parsed, validator._meta))
    } catch (err) {
      errors[key] = err as ValidationError
    }
  })

  // 5. If errors exist, report and throw
  if (Object.keys(errors).length > 0) {
    const report: ValidationReport = { errors, env: envSource }

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
