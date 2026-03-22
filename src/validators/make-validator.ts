// TODO: Implement makeValidator factory
import type { Validator, ValidatorOptions } from "../types.js"

export const makeValidator = <T>(
  _type: string,
  _parseFn: (value: string) => T,
  _options?: ValidatorOptions<T>
): Validator<T> => {
  // Stub — will be implemented in foundation/make-validator
  throw new Error("makeValidator not yet implemented")
}
