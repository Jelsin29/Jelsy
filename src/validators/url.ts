import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export interface UrlValidatorOptions extends ValidatorOptions<string> {
  protocols?: string[]
}

export const url = (options?: UrlValidatorOptions): Validator<string> => {
  const protocols = options?.protocols ?? ["http:", "https:"]

  if (options?.protocols && options.protocols.length === 0) {
    throw new Error("protocols array must not be empty")
  }

  return makeValidator<string>(
    "url",
    (value) => {
      let parsed: URL
      try {
        parsed = new URL(value)
      } catch {
        throw new Error("Invalid URL")
      }

      if (!protocols.includes(parsed.protocol)) {
        throw new Error(
          `Protocol "${parsed.protocol}" is not allowed. Must be one of: ${protocols.join(", ")}`
        )
      }

      return value
    },
    options
  )
}
