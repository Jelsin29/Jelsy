// TODO: Implement string validator
import type { Validator, ValidatorOptions } from "../types.js"

export interface StringValidatorOptions<
  C extends string = string
> extends ValidatorOptions<C> {
  choices?: readonly C[]
  minLength?: number
  maxLength?: number
}

export const string = <const C extends string = string>(
  _options?: StringValidatorOptions<C>
): Validator<C> => {
  // Stub — will be implemented in foundation/string-validator
  throw new Error("string validator not yet implemented")
}
