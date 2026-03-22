import { describe, it, expect } from "vitest"
import { makeValidator } from "../../src/validators/make-validator.js"

const stringParser = (value: string): string => value
const numberParser = (value: string): number => {
  const n = Number(value)
  if (Number.isNaN(n)) throw new Error("Not a number")
  return n
}

describe("makeValidator", () => {
  it("returns a valid Validator object", () => {
    const v = makeValidator("string", stringParser)

    expect(v).toHaveProperty("_parse")
    expect(v).toHaveProperty("_meta")
    expect(v).toHaveProperty("_output")
    expect(typeof v._parse).toBe("function")
    expect(v._meta.optional).toBe(false)
  })

  it("parses raw value correctly", () => {
    const v = makeValidator("string", stringParser)
    const result = v._parse("MY_VAR", "hello", undefined)

    expect(result).toBe("hello")
  })

  it("uses default when raw is missing", () => {
    const v = makeValidator("string", stringParser, { default: "fallback" })
    const result = v._parse("MY_VAR", undefined, "production")

    expect(result).toBe("fallback")
  })

  it("uses devDefault in non-production", () => {
    const v = makeValidator("string", stringParser, {
      devDefault: "dev-value"
    })
    const result = v._parse("MY_VAR", undefined, "development")

    expect(result).toBe("dev-value")
  })

  it("ignores devDefault in production and falls back to default", () => {
    const v = makeValidator("string", stringParser, {
      devDefault: "dev-value",
      default: "prod-fallback"
    })
    const result = v._parse("MY_VAR", undefined, "production")

    expect(result).toBe("prod-fallback")
  })

  it("ignores devDefault in production and throws when no default", () => {
    const v = makeValidator("string", stringParser, {
      devDefault: "dev-value"
    })

    expect(() => v._parse("MY_VAR", undefined, "production")).toThrow()
  })

  it("returns undefined for optional when raw is missing", () => {
    const v = makeValidator("string", stringParser, { optional: true })
    const result = v._parse("MY_VAR", undefined, undefined)

    expect(result).toBeUndefined()
  })

  it("throws for missing required variable", () => {
    const v = makeValidator("string", stringParser, {
      desc: "API key",
      example: "sk-123"
    })

    try {
      v._parse("API_KEY", undefined, undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["key"]).toBe("API_KEY")
      expect(e["kind"]).toBe("missing")
      expect(e["message"]).toBe("Required — missing and no default")
      expect(e["desc"]).toBe("API key")
      expect(e["example"]).toBe("sk-123")
    }
  })

  it("throws for invalid value with kind and received", () => {
    const v = makeValidator("number", numberParser, {
      desc: "Port number",
      example: "3000"
    })

    try {
      v._parse("PORT", "abc", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["key"]).toBe("PORT")
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("Not a number")
      expect(e["received"]).toBe("abc")
      expect(e["desc"]).toBe("Port number")
      expect(e["example"]).toBe("3000")
    }
  })

  it("applies transform to parsed value", () => {
    const v = makeValidator("string", stringParser, {
      transform: (val) => val.toUpperCase()
    })
    const result = v._parse("MY_VAR", "hello", undefined)

    expect(result).toBe("HELLO")
  })

  it("applies transform to default value", () => {
    const v = makeValidator("string", stringParser, {
      default: "hello",
      transform: (val) => val.toUpperCase()
    })
    const result = v._parse("MY_VAR", undefined, "production")

    expect(result).toBe("HELLO")
  })

  it("applies transform to devDefault value", () => {
    const v = makeValidator("string", stringParser, {
      devDefault: "hello",
      transform: (val) => val.toUpperCase()
    })
    const result = v._parse("MY_VAR", undefined, "development")

    expect(result).toBe("HELLO")
  })

  it("throws when transform fails on default value", () => {
    const v = makeValidator("string", stringParser, {
      default: "hello",
      transform: () => {
        throw new Error("transform boom")
      }
    })

    try {
      v._parse("MY_VAR", undefined, "production")
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["key"]).toBe("MY_VAR")
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("transform boom")
    }
  })

  it("throws when transform fails on devDefault value", () => {
    const v = makeValidator("string", stringParser, {
      devDefault: "hello",
      transform: () => {
        throw new Error("dev transform boom")
      }
    })

    try {
      v._parse("MY_VAR", undefined, "development")
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["key"]).toBe("MY_VAR")
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("dev transform boom")
    }
  })

  it("populates meta correctly", () => {
    const v = makeValidator("url", stringParser, {
      default: "https://example.com",
      devDefault: "http://localhost",
      optional: false,
      desc: "API endpoint",
      example: "https://api.example.com",
      docs: "https://docs.example.com/env"
    })

    expect(v._meta.type).toBe("url")
    expect(v._meta.default).toBe("https://example.com")
    expect(v._meta.devDefault).toBe("http://localhost")
    expect(v._meta.optional).toBe(false)
    expect(v._meta.desc).toBe("API endpoint")
    expect(v._meta.example).toBe("https://api.example.com")
    expect(v._meta.docs).toBe("https://docs.example.com/env")
  })
})
