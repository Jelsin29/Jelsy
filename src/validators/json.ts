// TODO: Implement json validator
import type { Validator, ValidatorOptions } from "../types.js"

export const json = <T = unknown>(
  _options?: ValidatorOptions<T>
): Validator<T> => {
  throw new Error("json validator not yet implemented")
}
