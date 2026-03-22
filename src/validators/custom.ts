// TODO: Implement custom validator
import type { Validator, ValidatorOptions } from "../types.js"

export interface CustomValidatorOptions<T> extends Omit<
  ValidatorOptions<T>,
  "transform"
> {
  parser: (value: string) => T
}

export const custom = <T>(
  _options: CustomValidatorOptions<T>
): Validator<T> => {
  throw new Error("custom validator not yet implemented")
}
