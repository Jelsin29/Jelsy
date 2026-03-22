// TODO: Implement enums validator
import type { Validator, ValidatorOptions } from "../types.js"

export interface EnumsValidatorOptions<
  V extends string
> extends ValidatorOptions<V> {
  values: readonly V[]
}

export const enums = <const V extends string>(
  _options: EnumsValidatorOptions<V>
): Validator<V> => {
  throw new Error("enums validator not yet implemented")
}
