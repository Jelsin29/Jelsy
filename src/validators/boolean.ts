import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

const BOOLEAN_MAP = new Map<string, boolean>([
  ["true", true],
  ["1", true],
  ["yes", true],
  ["on", true],
  ["false", false],
  ["0", false],
  ["no", false],
  ["off", false]
])

const ACCEPTED_VALUES = [...BOOLEAN_MAP.keys()].join(", ")

export const boolean = (
  options?: ValidatorOptions<boolean>
): Validator<boolean> =>
  makeValidator<boolean>(
    "boolean",
    (value) => {
      const result = BOOLEAN_MAP.get(value.toLowerCase())
      if (result === undefined) {
        throw new Error(
          `Must be one of: ${ACCEPTED_VALUES}`
        )
      }
      return result
    },
    options
  )
