import { describe, it, expect } from "vitest"
import { json } from "../../src/validators/json.js"

describe("json validator", () => {
  it("parses a JSON object", () => {
    const v = json()
    const result = v._parse("CFG", '{"a":1}', undefined)

    expect(result).toEqual({ a: 1 })
  })

  it("parses a JSON array", () => {
    const v = json()
    const result = v._parse("LIST", '["a","b"]', undefined)

    expect(result).toEqual(["a", "b"])
  })

  it("parses a primitive number", () => {
    const v = json()
    const result = v._parse("NUM", "42", undefined)

    expect(result).toBe(42)
  })

  it("parses null", () => {
    const v = json()
    const result = v._parse("NIL", "null", undefined)

    expect(result).toBeNull()
  })

  it("rejects invalid JSON", () => {
    const v = json()

    try {
      v._parse("BAD", "{invalid", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("rejects empty string", () => {
    const v = json()

    try {
      v._parse("EMPTY", "", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("uses default when raw is undefined", () => {
    const v = json({ default: [] as unknown[] })
    const result = v._parse("ARR", undefined, undefined)

    expect(result).toEqual([])
  })

  it("applies transform", () => {
    const v = json<Record<string, number>>({
      transform: (val) => ({ ...val, y: 2 })
    })
    const result = v._parse("OBJ", '{"x":1}', undefined)

    expect(result).toEqual({ x: 1, y: 2 })
  })

  it("parses nested objects", () => {
    const v = json()
    const result = v._parse("NESTED", '{"a":{"b":[1,2]}}', undefined)

    expect(result).toEqual({ a: { b: [1, 2] } })
  })

  it("parses boolean JSON", () => {
    const v = json()
    const result = v._parse("BOOL", "true", undefined)

    expect(result).toBe(true)
  })
})
