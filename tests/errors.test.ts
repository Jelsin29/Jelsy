import { describe, it, expect } from "vitest"
import { JelsyError, JelsyAccessError } from "../src/errors.js"
import type { ValidationError } from "../src/types.js"

describe("JelsyError", () => {
  const errors: Record<string, ValidationError> = {
    PORT: {
      key: "PORT",
      kind: "missing",
      message: "Missing required"
    },
    API_KEY: {
      key: "API_KEY",
      kind: "invalid",
      message: "Invalid value",
      received: "abc"
    }
  }

  it("stores errors record", () => {
    const error = new JelsyError(errors)
    expect(error.errors).toBe(errors)
    expect(error.errors["PORT"]?.kind).toBe("missing")
    expect(error.errors["API_KEY"]?.received).toBe("abc")
  })

  it("has correct name", () => {
    const error = new JelsyError(errors)
    expect(error.name).toBe("JelsyError")
  })

  it("is instanceof Error", () => {
    const error = new JelsyError(errors)
    expect(error).toBeInstanceOf(Error)
  })

  it("has a summary message", () => {
    const error = new JelsyError(errors)
    expect(error.message).toBe("Environment validation failed")
  })
})

describe("JelsyAccessError", () => {
  it("stores key", () => {
    const error = new JelsyAccessError("MISSING_VAR")
    expect(error.key).toBe("MISSING_VAR")
  })

  it("has correct name", () => {
    const error = new JelsyAccessError("MISSING_VAR")
    expect(error.name).toBe("JelsyAccessError")
  })

  it("is instanceof Error", () => {
    const error = new JelsyAccessError("MISSING_VAR")
    expect(error).toBeInstanceOf(Error)
  })

  it("includes key in message", () => {
    const error = new JelsyAccessError("MISSING_VAR")
    expect(error.message).toContain("MISSING_VAR")
  })
})
