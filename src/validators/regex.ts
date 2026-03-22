import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export interface RegexValidatorOptions extends ValidatorOptions<string> {
  pattern: RegExp
}

export const regex = (options: RegexValidatorOptions): Validator<string> => {
  return makeValidator<string>(
    "regex",
    (value) => {
      if (!options.pattern.test(value)) {
        throw new Error(`Must match pattern ${options.pattern}`)
      }
      return value
    },
    options
  )
}
