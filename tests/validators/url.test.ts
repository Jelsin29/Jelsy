import { describe, it, expect } from "vitest"
import { url } from "../../src/validators/url.js"

describe("url validator", () => {
  it("valid HTTPS URL passes", () => {
    const v = url()
    const result = v._parse("API_URL", "https://example.com", undefined)

    expect(result).toBe("https://example.com")
  })

  it("HTTP with path passes", () => {
    const v = url()
    const result = v._parse("API_URL", "http://example.com/api/v1", undefined)

    expect(result).toBe("http://example.com/api/v1")
  })

  it("custom protocol accepted", () => {
    const v = url({ protocols: ["redis:", "rediss:"] })
    const result = v._parse("REDIS_URL", "redis://localhost:6379", undefined)

    expect(result).toBe("redis://localhost:6379")
  })

  it("not a URL rejected", () => {
    const v = url()

    try {
      v._parse("API_URL", "not-a-url", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("wrong protocol rejected with default protocols", () => {
    const v = url()

    try {
      v._parse("API_URL", "ftp://files.example.com", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toContain("ftp:")
    }
  })

  it("custom protocol rejects non-matching protocol", () => {
    const v = url({ protocols: ["redis:"] })

    try {
      v._parse("REDIS_URL", "https://example.com", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toContain("https:")
    }
  })

  it("empty string rejected", () => {
    const v = url()

    try {
      v._parse("API_URL", "", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("default value used when missing", () => {
    const v = url({ default: "https://fallback.com" })
    const result = v._parse("API_URL", undefined, "production")

    expect(result).toBe("https://fallback.com")
  })

  it("transform applied", () => {
    const v = url({ transform: (v) => v.replace(/\/$/, "") })
    const result = v._parse("API_URL", "https://example.com/", undefined)

    expect(result).toBe("https://example.com")
  })

  it("URL with port and query passes", () => {
    const v = url()
    const result = v._parse(
      "API_URL",
      "https://example.com:8080/path?q=1",
      undefined
    )

    expect(result).toBe("https://example.com:8080/path?q=1")
  })

  it("rejects javascript: protocol", () => {
    const v = url()

    try {
      v._parse("API_URL", "javascript:alert(1)", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })
})
