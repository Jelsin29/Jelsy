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

  const _parse = (
    key: string,
    raw: string | undefined,
    nodeEnv: string | undefined
  ): T => {
    if (raw === undefined) {
      if (options?.devDefault !== undefined && nodeEnv !== "production") {
        const val = options.devDefault
        if (options?.transform) {
          try {
            return options.transform(val)
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            throw {
              key,
              kind: "invalid" as const,
              message,
              desc: options?.desc,
              example: options?.example
            }
          }
        }
        return val
      }
      if (options?.default !== undefined) {
        const val = options.default
        if (options?.transform) {
          try {
            return options.transform(val)
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            throw {
              key,
              kind: "invalid" as const,
              message,
              desc: options?.desc,
              example: options?.example
            }
          }
        }
        return val
      }
      if (options?.optional) {
        return undefined as T
      }
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
      throw {
        key,
        kind: "invalid" as const,
        message,
        received: raw,
        desc: options?.desc,
        example: options?.example
      }
    }

    if (options?.transform) {
      parsed = options.transform(parsed)
    }

    return parsed
  }

  return {
    _output: undefined as unknown as T,
    _parse,
    _meta: meta
  }
}
