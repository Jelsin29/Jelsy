import type { Validator, ValidatorOptions } from "../types.js"
import { makeValidator } from "./make-validator.js"

/**
 * Validates that the env var is valid JSON and parses it.
 *
 * `T` is a type-level assertion only — `JSON.parse` returns `unknown` at runtime.
 * Callers needing runtime shape validation should use `transform` or a schema library.
 */
export const json = <T = unknown>(
  options?: ValidatorOptions<T>
): Validator<T> =>
  makeValidator<T>("json", (value) => JSON.parse(value) as T, options)
