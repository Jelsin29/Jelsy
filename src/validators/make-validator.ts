import type { Validator, ValidatorMeta, ValidatorOptions } from "../types.js"

export const makeValidator = <T>(
  type: string,
  parseFn: (value: string) => T,
  options?: ValidatorOptions<T>
): Validator<T> => {
  const meta: ValidatorMeta<T> = {
    type,
    optional: options?.optional ?? false,
    ...(options?.default !== undefined && { default: options.default }),
    ...(options?.devDefault !== undefined && {
      devDefault: options.devDefault
    }),
    ...(options?.desc !== undefined && { desc: options.desc }),
    ...(options?.example !== undefined && { example: options.example }),
    ...(options?.docs !== undefined && { docs: options.docs })
  }

  const applyTransform = (key: string, value: T, raw?: string): T => {
    if (!options?.transform) return value
    try {
      return options.transform(value)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw {
        key,
        kind: "invalid" as const,
        message,
        ...(raw !== undefined && { received: raw }),
        desc: options.desc,
        example: options.example
      }
    }
  }

  // @internal — _parse throws plain ValidationError-shaped objects (not Error instances).
  // This is intentional: createEnv catches these and collects them into a report.
  const _parse = (
    key: string,
    raw: string | undefined,
    nodeEnv: string | undefined
  ): T => {
    if (raw === undefined) {
      if (options?.devDefault !== undefined && nodeEnv !== "production") {
        return applyTransform(key, options.devDefault)
      }
      if (options?.default !== undefined) {
        return applyTransform(key, options.default)
      }
      if (options?.optional) {
        return undefined as T
      }
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw {
        key,
        kind: "missing" as const,
        message: "Required — missing and no default",
        desc: options?.desc,
        example: options?.example
      }
    }

    let parsed: T
    try {
      parsed = parseFn(raw)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw {
        key,
        kind: "invalid" as const,
        message,
        received: raw,
        desc: options?.desc,
        example: options?.example
      }
    }

    return applyTransform(key, parsed, raw)
  }

  return {
    _output: undefined as unknown as T,
    _parse,
    _meta: meta
  }
}
