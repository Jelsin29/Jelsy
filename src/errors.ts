// TODO: Implement error classes
import type { ValidationError } from "./types.js"

export class JelsyError extends Error {
  public readonly errors: Record<string, ValidationError>

  constructor(errors: Record<string, ValidationError>) {
    super("Environment validation failed")
    this.name = "JelsyError"
    this.errors = errors
  }
}

export class JelsyAccessError extends Error {
  public readonly key: string

  constructor(key: string) {
    super(`Environment variable "${key}" is not defined in the schema`)
    this.name = "JelsyAccessError"
    this.key = key
  }
}
