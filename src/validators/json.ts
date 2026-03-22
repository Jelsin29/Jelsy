import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export const json = <T = unknown>(
  options?: ValidatorOptions<T>
): Validator<T> =>
  makeValidator<T>(
    "json",
    (value) => JSON.parse(value) as T,
    options
  )
