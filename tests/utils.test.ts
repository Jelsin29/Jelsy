import { describe, it, expect, afterAll } from "vitest"
import { isEmpty, truncateValue, isProduction } from "../src/utils.js"

describe("isEmpty", () => {
  it("returns true for undefined", () => {
    expect(isEmpty(undefined)).toBe(true)
  })

  it("returns true for empty string", () => {
    expect(isEmpty("")).toBe(true)
  })

  it("returns false for non-empty string", () => {
    expect(isEmpty("hello")).toBe(false)
  })

  it("returns false for whitespace-only string", () => {
    expect(isEmpty(" ")).toBe(false)
  })
})

describe("truncateValue", () => {
  it("returns short strings as-is", () => {
    expect(truncateValue("short")).toBe("short")
    expect(truncateValue("12345678")).toBe("12345678")
  })

  it("truncates long strings", () => {
    expect(truncateValue("123456789")).toBe("1234***")
    expect(truncateValue("my-super-secret-api-key")).toBe("my-s***")
  })
})

describe("isProduction", () => {
  const originalEnv = process.env["NODE_ENV"]

  it("returns true when NODE_ENV is production", () => {
    process.env["NODE_ENV"] = "production"
    expect(isProduction()).toBe(true)
  })

  it("returns false when NODE_ENV is development", () => {
    process.env["NODE_ENV"] = "development"
    expect(isProduction()).toBe(false)
  })

  it("returns false when NODE_ENV is undefined", () => {
    delete process.env["NODE_ENV"]
    expect(isProduction()).toBe(false)
  })

  afterAll(() => {
    if (originalEnv !== undefined) {
      process.env["NODE_ENV"] = originalEnv
    } else {
      delete process.env["NODE_ENV"]
    }
  })
})
