import type { ValidationError } from "./types.js"

export class JelsyError extends Error {
  public readonly errors: Record<string, ValidationError>

  constructor(errors: Record<string, ValidationError>) {
    super("Environment validation failed")
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = "JelsyError"
    this.errors = errors
  }
}

export class JelsyAccessError extends Error {
  public readonly key: string

  constructor(key: string) {
    super(`"${key}" is not in schema`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = "JelsyAccessError"
    this.key = key
  }
}
