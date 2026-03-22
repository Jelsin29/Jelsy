import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export interface RegexValidatorOptions extends ValidatorOptions<string> {
  pattern: RegExp
}

export const regex = (options: RegexValidatorOptions): Validator<string> => {
  const pattern = new RegExp(options.pattern.source, options.pattern.flags)

  return makeValidator<string>(
    "regex",
    (value) => {
      if (pattern.global || pattern.sticky) {
        pattern.lastIndex = 0
      }
      if (!pattern.test(value)) {
        throw new Error(`Must match pattern ${pattern}`)
      }
      return value
    },
    options
  )
}
