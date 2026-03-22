import { describe, it, expect } from "vitest"
import { string } from "../../src/validators/string.js"

describe("string validator", () => {
  it("choices containing empty string passes", () => {
    const v = string({ choices: ["", "none"] as const })
    const result = v._parse("MODE", "", undefined)
    expect(result).toBe("")
  })

  it("valid non-empty string passes", () => {
    const v = string()
    const result = v._parse("MY_VAR", "hello", undefined)

    expect(result).toBe("hello")
  })

  it("empty string rejected by default (minLength: 1)", () => {
    const v = string()

    try {
      v._parse("MY_VAR", "", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("Must be at least 1 character")
    }
  })

  it("empty string allowed with minLength: 0", () => {
    const v = string({ minLength: 0 })
    const result = v._parse("MY_VAR", "", undefined)

    expect(result).toBe("")
  })

  it("respects maxLength", () => {
    const v = string({ maxLength: 5 })

    expect(v._parse("MY_VAR", "hello", undefined)).toBe("hello")

    try {
      v._parse("MY_VAR", "toolong", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("Must be at most 5 characters")
    }
  })

  it("choices constraint — valid choice passes", () => {
    const v = string({ choices: ["dev", "staging", "prod"] as const })
    const result = v._parse("ENV", "dev", undefined)

    expect(result).toBe("dev")
  })

  it("choices constraint — invalid choice rejected", () => {
    const v = string({ choices: ["dev", "staging", "prod"] as const })

    try {
      v._parse("ENV", "local", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("Must be one of: dev, staging, prod")
    }
  })

  it("default value used when missing", () => {
    const v = string({ default: "fallback" })
    const result = v._parse("MY_VAR", undefined, "production")

    expect(result).toBe("fallback")
  })

  it("devDefault used in development", () => {
    const v = string({ devDefault: "dev-value" })
    const result = v._parse("MY_VAR", undefined, "development")

    expect(result).toBe("dev-value")
  })

  it("transform applied", () => {
    const v = string({ transform: (val) => val.toUpperCase() })
    const result = v._parse("MY_VAR", "hello", undefined)

    expect(result).toBe("HELLO")
  })

  it("optional returns undefined when missing", () => {
    const v = string({ optional: true })
    const result = v._parse("MY_VAR", undefined, undefined)

    expect(result).toBeUndefined()
  })

  it("error message includes allowed choices", () => {
    const v = string({ choices: ["a", "b", "c"] as const })

    try {
      v._parse("MY_VAR", "x", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["message"]).toContain("a")
      expect(e["message"]).toContain("b")
      expect(e["message"]).toContain("c")
    }
  })
})
