import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

export interface StringValidatorOptions<
  C extends string = string
> extends ValidatorOptions<C> {
  choices?: readonly C[]
  minLength?: number
  maxLength?: number
}

export const string = <const C extends string = string>(
  options?: StringValidatorOptions<C>
): Validator<C> => {
  const minLength = options?.choices
    ? (options?.minLength ?? 0)
    : (options?.minLength ?? 1)

  return makeValidator<C>(
    "string",
    (value) => {
      if (minLength > 0 && value.length < minLength) {
        throw new Error(
          `Must be at least ${minLength} character${minLength === 1 ? "" : "s"}`
        )
      }
      if (
        options?.maxLength !== undefined &&
        value.length > options.maxLength
      ) {
        throw new Error(`Must be at most ${options.maxLength} characters`)
      }
      if (options?.choices && !options.choices.includes(value as C)) {
        throw new Error(`Must be one of: ${options.choices.join(", ")}`)
      }
      return value as C
    },
    options
  )
}
