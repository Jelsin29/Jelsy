// TODO: Implement url validator
import type { Validator, ValidatorOptions } from "../types.js"

export interface UrlValidatorOptions extends ValidatorOptions<string> {
  protocols?: string[]
}

export const url = (_options?: UrlValidatorOptions): Validator<string> => {
  throw new Error("url validator not yet implemented")
}
