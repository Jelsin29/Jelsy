import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

// Intentionally practical regex — not RFC 5322 compliant.
// May accept edge cases like "a@b..c". This is a deliberate tradeoff
// for simplicity; do not "fix" without updating tests and docs.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const email = (options?: ValidatorOptions<string>): Validator<string> =>
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
