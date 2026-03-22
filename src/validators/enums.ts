import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export interface EnumsValidatorOptions<
  V extends string
> extends ValidatorOptions<V> {
  values: readonly V[]
}

export const enums = <const V extends string>(
  options: EnumsValidatorOptions<V>
): Validator<V> => {
  if (options.values.length === 0) {
    throw new Error("No valid values are defined")
  }

  return makeValidator<V>(
    "enums",
    (value) => {
      if (!options.values.includes(value as V)) {
        throw new Error(`Must be one of: ${options.values.join(", ")}`)
      }
      return value as V
    },
    options
  )
}
