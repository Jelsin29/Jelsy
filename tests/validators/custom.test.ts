import { describe, it, expect } from "vitest"
import { custom } from "../../src/validators/custom.js"

describe("custom validator", () => {
  it("successful parse — splits CSV string into array", () => {
    const v = custom({ parser: (v) => v.split(",") })
    const result = v._parse("MY_VAR", "a,b,c", undefined)

    expect(result).toEqual(["a", "b", "c"])
  })

  it("parser returns number — parses hex string", () => {
    const v = custom({ parser: (v) => parseInt(v, 16) })
    const result = v._parse("HEX_VAR", "ff", undefined)

    expect(result).toBe(255)
  })

  it("parser throws Error — propagates message with invalid kind", () => {
    const v = custom({
      parser: () => {
        throw new Error("bad format")
      }
    })

    try {
      v._parse("MY_VAR", "anything", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
      expect(e["message"]).toBe("bad format")
    }
  })

  it("parser throws non-Error string — still produces invalid kind", () => {
    const v = custom({
      parser: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw "string error"
      }
    })

    try {
      v._parse("MY_VAR", "anything", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })

  it("default value used when raw is undefined", () => {
    const v = custom({ parser: (v) => v, default: "fallback" })
    const result = v._parse("MY_VAR", undefined, "production")

    expect(result).toBe("fallback")
  })

  it("optional returns undefined when raw is undefined", () => {
    const v = custom({ parser: (v) => v, optional: true })
    const result = v._parse("MY_VAR", undefined, undefined)

    expect(result).toBeUndefined()
  })

  it("complex parser — parses duration string to seconds", () => {
    const v = custom({
      parser: (v) => {
        const m = /^(\d+)(s|m|h)$/.exec(v)
        if (!m) throw new Error("Invalid duration")
        return (
          parseInt(m[1]) *
          ({ s: 1, m: 60, h: 3600 }[m[2] as "s" | "m" | "h"])
        )
      }
    })
    const result = v._parse("TIMEOUT", "30s", undefined)

    expect(result).toBe(30)
  })

  it("complex parser failure — invalid duration throws", () => {
    const v = custom({
      parser: (v) => {
        const m = /^(\d+)(s|m|h)$/.exec(v)
        if (!m) throw new Error("Invalid duration")
        return (
          parseInt(m[1]) *
          ({ s: 1, m: 60, h: 3600 }[m[2] as "s" | "m" | "h"])
        )
      }
    })

    try {
      v._parse("TIMEOUT", "abc", undefined)
      expect.unreachable("should have thrown")
    } catch (err) {
      const e = err as Record<string, unknown>
      expect(e["kind"]).toBe("invalid")
    }
  })
})
