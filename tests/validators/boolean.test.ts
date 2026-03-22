import { describe, it, expect } from "vitest"
import { boolean } from "../../src/validators/boolean.js"

describe("boolean validator", () => {
  it('"true" parses to true', () => {
    const v = boolean()
    expect(v._parse("FLAG", "true", undefined)).toBe(true)
  })

  it('"TRUE" (case-insensitive) parses to true', () => {
    const v = boolean()
    expect(v._parse("FLAG", "TRUE", undefined)).toBe(true)
  })

  it('"1" parses to true', () => {
    const v = boolean()
    expect(v._parse("FLAG", "1", undefined)).toBe(true)
  })

  it('"yes" parses to true', () => {
    const v = boolean()
    expect(v._parse("FLAG", "yes", undefined)).toBe(true)
  })

  it('"On" (mixed case) parses to true', () => {
    const v = boolean()
    expect(v._parse("FLAG", "On", undefined)).toBe(true)
  })

  it('"false" parses to false', () => {
    const v = boolean()
    expect(v._parse("FLAG", "false", undefined)).toBe(false)
  })

  it('"0" parses to false', () => {
    const v = boolean()
    expect(v._parse("FLAG", "0", undefined)).toBe(false)
  })

  it('"NO" (case-insensitive) parses to false', () => {
    const v = boolean()
    expect(v._parse("FLAG", "NO", undefined)).toBe(false)
  })

  it('"off" parses to false', () => {
    const v = boolean()
    expect(v._parse("FLAG", "off", undefined)).toBe(false)
  })

  it('"maybe" throws with kind "invalid" listing accepted values', () => {
    const v = boolean()

    try {
      v._parse("FLAG", "maybe", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe(
        "Must be one of: true, false, 1, 0, yes, no, on, off"
      )
    }
  })

  it("default value used when raw is undefined", () => {
    const v = boolean({ default: false })
    expect(v._parse("FLAG", undefined, "production")).toBe(false)
  })

  it("transform is applied to parsed value", () => {
    const v = boolean({ transform: (val) => !val })
    expect(v._parse("FLAG", "true", undefined)).toBe(false)
  })
})
