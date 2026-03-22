import { describe, it, expect } from "vitest"
import { regex } from "../../src/validators/regex.js"

describe("regex validator", () => {
  it("matching value passes", () => {
    const v = regex({ pattern: /^\d{3}$/ })
    const result = v._parse("CODE", "123", undefined)

    expect(result).toBe("123")
  })

  it("non-matching value throws with kind invalid", () => {
    const v = regex({ pattern: /^\d{3}$/ })

    try {
      v._parse("CODE", "12", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("partial match with anchored pattern throws", () => {
    const v = regex({ pattern: /^\d+$/ })

    try {
      v._parse("NUM", "12abc", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("complex pattern matches", () => {
    const v = regex({ pattern: /^[a-z]{2}-[a-z]+-\d$/ })
    const result = v._parse("REGION", "us-east-1", undefined)

    expect(result).toBe("us-east-1")
  })

  it("empty string against non-empty pattern throws", () => {
    const v = regex({ pattern: /^.+$/ })

    try {
      v._parse("VAL", "", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("default value used when missing", () => {
    const v = regex({ pattern: /^\d+$/, default: "42" })
    const result = v._parse("NUM", undefined, "production")

    expect(result).toBe("42")
  })

  it("transform applied after validation", () => {
    const v = regex({ pattern: /^\d+$/, transform: (val) => val.padStart(5, "0") })
    const result = v._parse("NUM", "42", undefined)

    expect(result).toBe("00042")
  })

  it("error message references the pattern", () => {
    const v = regex({ pattern: /^v\d+$/ })

    try {
      v._parse("VER", "abc", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      const message = e["message"] as string
      expect(message).toMatch(/pattern|does not match/i)
    }
  })
})
