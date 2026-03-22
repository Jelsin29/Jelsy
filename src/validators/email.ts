import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const email = (
  options?: ValidatorOptions<string>
): Validator<string> =>
  makeValidator<string>(
    "email",
    (value) => {
      if (!EMAIL_RE.test(value)) {
        throw new Error("Must be a valid email address")
      }
      return value
    },
    options
  )
