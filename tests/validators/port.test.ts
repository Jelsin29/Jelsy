import { describe, it, expect } from "vitest"
import { port } from "../../src/validators/port.js"

describe("port", () => {
  it("parses a valid port string to number", () => {
    const v = port()
    const result = v._parse("PORT", "3000", undefined)

    expect(result).toBe(3000)
  })

  it("accepts boundary min port 1", () => {
    const v = port()
    const result = v._parse("PORT", "1", undefined)

    expect(result).toBe(1)
  })

  it("accepts boundary max port 65535", () => {
    const v = port()
    const result = v._parse("PORT", "65535", undefined)

    expect(result).toBe(65535)
  })

  it("rejects zero", () => {
    const v = port()

    try {
      v._parse("PORT", "0", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toContain("at least 1")
    }
  })

  it("rejects above max 65535", () => {
    const v = port()

    try {
      v._parse("PORT", "65536", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toContain("at most 65535")
    }
  })

  it("rejects float value", () => {
    const v = port()

    try {
      v._parse("PORT", "3000.5", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toContain("not a valid number")
    }
  })

  it("rejects non-numeric input", () => {
    const v = port()

    try {
      v._parse("PORT", "abc", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("rejects negative input", () => {
    const v = port()

    try {
      v._parse("PORT", "-1", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("uses default value when raw is missing", () => {
    const v = port({ default: 3000 })
    const result = v._parse("PORT", undefined, "production")

    expect(result).toBe(3000)
  })

  it("applies transform after parsing", () => {
    const v = port({ transform: (v) => v + 1 })
    const result = v._parse("PORT", "8080", undefined)

    expect(result).toBe(8081)
  })

  it("rejects scientific notation", () => {
    const v = port()

    try {
      v._parse("PORT", "3e3", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("rejects hex notation", () => {
    const v = port()

    try {
      v._parse("PORT", "0x1F90", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("rejects whitespace-padded input", () => {
    const v = port()

    try {
      v._parse("PORT", "  3000  ", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })
})
