import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export interface UrlValidatorOptions extends ValidatorOptions<string> {
  protocols?: string[]
}

export const url = (options?: UrlValidatorOptions): Validator<string> => {
  if (options?.protocols?.length === 0) {
    throw new Error("protocols array must not be empty")
  }

  if (options?.protocols) {
    const bad = options.protocols.filter((p) => !p.endsWith(":"))
    if (bad.length > 0) {
      throw new Error(`Protocols must end with ":"`)

    }
  }

  const protocols = options?.protocols ?? ["http:", "https:"]

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
        throw new Error(`Protocol "${parsed.protocol}" not allowed`)
      }

      return value
    },
    options
  )
}
