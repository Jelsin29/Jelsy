import { describe, it, expect } from "vitest"
import { number } from "../../src/validators/number.js"

describe("number", () => {
  it("parses a valid numeric string to number", () => {
    const v = number()
    const result = v._parse("PORT", "42", undefined)

    expect(result).toBe(42)
  })

  it("parses a float string correctly", () => {
    const v = number()
    const result = v._parse("RATE", "3.14", undefined)

    expect(result).toBe(3.14)
  })

  it("parses scientific notation", () => {
    const v = number()
    const result = v._parse("LIMIT", "1e3", undefined)

    expect(result).toBe(1000)
  })

  it("rejects NaN input", () => {
    const v = number()

    try {
      v._parse("PORT", "abc", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe('"abc" is not a valid number')
    }
  })

  it("rejects Infinity", () => {
    const v = number()

    try {
      v._parse("VAL", "Infinity", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe('"Infinity" is not a finite number')
    }
  })

  it("rejects non-integer when integer: true", () => {
    const v = number({ integer: true })

    try {
      v._parse("COUNT", "3.14", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe('"3.14" is not an integer')
    }
  })

  it("accepts integer when integer: true", () => {
    const v = number({ integer: true })
    const result = v._parse("COUNT", "42", undefined)

    expect(result).toBe(42)
  })

  it("rejects value below min", () => {
    const v = number({ min: 10 })

    try {
      v._parse("PORT", "5", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("Must be at least 10")
    }
  })

  it("rejects value above max", () => {
    const v = number({ max: 100 })

    try {
      v._parse("PORT", "200", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("Must be at most 100")
    }
  })

  it("uses default value when raw is missing", () => {
    const v = number({ default: 3000 })
    const result = v._parse("PORT", undefined, "production")

    expect(result).toBe(3000)
  })

  it("applies transform after parsing", () => {
    const v = number({ transform: (n) => n * 2 })
    const result = v._parse("VAL", "5", undefined)

    expect(result).toBe(10)
  })
})
