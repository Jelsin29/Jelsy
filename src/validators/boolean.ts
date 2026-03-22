import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

const BOOLEAN_MAP = new Map<string, boolean>([
  ["true", true],
  ["false", false],
  ["1", true],
  ["0", false],
  ["yes", true],
  ["no", false],
  ["on", true],
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
