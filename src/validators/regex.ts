// TODO: Implement regex validator
import type { Validator, ValidatorOptions } from "../types.js"

export interface RegexValidatorOptions extends ValidatorOptions<string> {
  pattern: RegExp
}

export const regex = (_options: RegexValidatorOptions): Validator<string> => {
  throw new Error("regex validator not yet implemented")
}
