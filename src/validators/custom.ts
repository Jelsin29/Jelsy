import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export interface CustomValidatorOptions<T>
  extends Omit<ValidatorOptions<T>, "transform"> {
  parser: (value: string) => T
}

export const custom = <T>(
  options: CustomValidatorOptions<T>
): Validator<T> => {
  return makeValidator<T>(
    "custom",
    options.parser,
    options
  )
}
