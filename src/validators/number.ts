import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export interface NumberValidatorOptions extends ValidatorOptions<number> {
  min?: number
  max?: number
  integer?: boolean
}

export const number = (options?: NumberValidatorOptions): Validator<number> => {
  return makeValidator<number>(
    "number",
    (value) => {
      if (!/^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(value)) {
        throw new Error(`"${value}" is not a valid number`)
      }
      const num = Number(value)
      if (Number.isNaN(num)) {
        throw new Error(`"${value}" is not a valid number`)
      }
      if (!Number.isFinite(num)) {
        throw new Error(`"${value}" is not a finite number`)
      }
      if (options?.integer && !Number.isInteger(num)) {
        throw new Error(`"${value}" is not an integer`)
      }
      if (options?.min !== undefined && num < options.min) {
        throw new Error(`Must be at least ${options.min}`)
      }
      if (options?.max !== undefined && num > options.max) {
        throw new Error(`Must be at most ${options.max}`)
      }
      return num
    },
    options
  )
}
