// TODO: Implement number validator
import type { Validator, ValidatorOptions } from "../types.js"

export interface NumberValidatorOptions extends ValidatorOptions<number> {
  min?: number
  max?: number
  integer?: boolean
}

export const number = (
  _options?: NumberValidatorOptions
): Validator<number> => {
  // Stub — will be implemented in foundation/number-validator
  throw new Error("number validator not yet implemented")
}
