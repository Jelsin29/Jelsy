import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export const port = (options?: ValidatorOptions<number>): Validator<number> => {
  return makeValidator<number>(
    "port",
    (value) => {
      if (!/^\d+$/.test(value)) {
        throw new Error(`"${value}" is not a valid number`)
      }
      const num = Number(value)
      if (num < 1) {
        throw new Error("Must be at least 1")
      }
      if (num > 65535) {
        throw new Error("Must be at most 65535")
      }
      return num
    },
    options
  )
}
