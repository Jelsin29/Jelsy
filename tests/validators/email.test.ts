import { describe, it, expect } from "vitest"
import { email } from "../../src/validators/email.js"

describe("email validator", () => {
  it("standard email passes", () => {
    const v = email()
    const result = v._parse("EMAIL", "user@example.com", undefined)

    expect(result).toBe("user@example.com")
  })

  it("subdomain email passes", () => {
    const v = email()
    const result = v._parse("EMAIL", "admin@mail.example.co.uk", undefined)

    expect(result).toBe("admin@mail.example.co.uk")
  })

  it("plus addressing passes", () => {
    const v = email()
    const result = v._parse("EMAIL", "user+tag@example.com", undefined)

    expect(result).toBe("user+tag@example.com")
  })

  it("missing @ rejected", () => {
    const v = email()

    try {
      v._parse("EMAIL", "userexample.com", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("missing domain dot rejected", () => {
    const v = email()

    try {
      v._parse("EMAIL", "user@localhost", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("spaces rejected", () => {
    const v = email()

    try {
      v._parse("EMAIL", "user @example.com", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("empty local part rejected", () => {
    const v = email()

    try {
      v._parse("EMAIL", "@example.com", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("default value used when missing", () => {
    const v = email({ default: "admin@example.com" })
    const result = v._parse("EMAIL", undefined, "production")

    expect(result).toBe("admin@example.com")
  })

  it("transform applied", () => {
    const v = email({ transform: (val) => val.toLowerCase() })
    const result = v._parse("EMAIL", "Admin@Example.COM", undefined)

    expect(result).toBe("admin@example.com")
  })

  it("empty string rejected", () => {
    const v = email()

    try {
      v._parse("EMAIL", "", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("accepts single-char TLD", () => {
    const v = email()
    const result = v._parse("EMAIL", "a@b.c", undefined)

    expect(result).toBe("a@b.c")
  })
})
