import { describe, it, expect } from "vitest"
import { enums } from "../../src/validators/enums.js"

describe("enums validator", () => {
  it("valid value passes", () => {
    const v = enums({ values: ["dev", "staging", "prod"] as const })
    const result = v._parse("NODE_ENV", "dev", undefined)

    expect(result).toBe("dev")
  })

  it("invalid value rejected", () => {
    const v = enums({ values: ["dev", "staging", "prod"] as const })

    try {
      v._parse("NODE_ENV", "local", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toContain("Must be one of: dev, staging, prod")
    }
  })

  it("case-sensitive — uppercase rejected for lowercase value", () => {
    const v = enums({ values: ["dev"] as const })

    try {
      v._parse("NODE_ENV", "DEV", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("empty values array rejects any value", () => {
    const v = enums({ values: [] as const })

    try {
      v._parse("MY_VAR", "anything", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("No valid values are defined")
    }
  })

  it("default value used when raw is undefined", () => {
    const v = enums({ values: ["a", "b"] as const, default: "a" })
    const result = v._parse("MY_VAR", undefined, "production")

    expect(result).toBe("a")
  })

  it("single value passes", () => {
    const v = enums({ values: ["only"] as const })
    const result = v._parse("MY_VAR", "only", undefined)

    expect(result).toBe("only")
  })

  it("transform applied to parsed value", () => {
    const v = enums({
      values: ["dev", "prod"] as const,
      transform: (v) => v
    })
    const result = v._parse("NODE_ENV", "prod", undefined)

    expect(result).toBe("prod")
  })

  it("error message lists all allowed values", () => {
    const v = enums({ values: ["x", "y", "z"] as const })

    try {
      v._parse("MY_VAR", "w", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["message"]).toContain("x")
      expect(e["message"]).toContain("y")
      expect(e["message"]).toContain("z")
    }
  })
})
