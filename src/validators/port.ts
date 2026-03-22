// TODO: Implement port validator
import type { Validator, ValidatorOptions } from "../types.js"

export const port = (
  _options?: ValidatorOptions<number>
): Validator<number> => {
  throw new Error("port validator not yet implemented")
}
