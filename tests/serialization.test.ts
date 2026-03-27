import { describe, it, expect } from "vitest"
import { createEnv, string, number, port, boolean, url, email } from "../src/index.js"

// ---------------------------------------------------------------------------
// Serialization tests — proving Jelsy (Object.freeze) beats Proxy libraries
// ---------------------------------------------------------------------------

const makeEnv = () =>
  createEnv(
    {
      HOST: string({ default: "localhost" }),
      PORT: port({ default: 3000 }),
      DEBUG: boolean({ default: false }),
      API_URL: url({ default: "https://api.example.com" }),
      ADMIN_EMAIL: email({ default: "admin@example.com" }),
      MAX_RETRIES: number({ default: 3 })
    },
    { env: {} }
  )

// ---------------------------------------------------------------------------
// structuredClone
// ---------------------------------------------------------------------------
describe("structuredClone", () => {
  it("works on frozen env object", () => {
    const env = makeEnv()
    const clone = structuredClone(env)
    expect(clone).toEqual({
      HOST: "localhost",
      PORT: 3000,
      DEBUG: false,
      API_URL: "https://api.example.com",
      ADMIN_EMAIL: "admin@example.com",
      MAX_RETRIES: 3
    })
  })

  it("produces an independent copy — mutations do not affect original", () => {
    const env = makeEnv()
    const clone = structuredClone(env) as Record<string, unknown>
    clone["HOST"] = "MUTATED"
    expect(env.HOST).toBe("localhost")
  })

  it("does not include non-enumerable explain()", () => {
    const env = makeEnv()
    const clone = structuredClone(env) as Record<string, unknown>
    expect(clone).not.toHaveProperty("explain")
  })
})

// ---------------------------------------------------------------------------
// JSON.stringify
// ---------------------------------------------------------------------------
describe("JSON.stringify", () => {
  it("produces correct JSON with all properties", () => {
    const env = makeEnv()
    const json = JSON.stringify(env)
    const parsed = JSON.parse(json) as Record<string, unknown>
    expect(parsed["HOST"]).toBe("localhost")
    expect(parsed["PORT"]).toBe(3000)
    expect(parsed["DEBUG"]).toBe(false)
    expect(parsed["API_URL"]).toBe("https://api.example.com")
    expect(parsed["ADMIN_EMAIL"]).toBe("admin@example.com")
    expect(parsed["MAX_RETRIES"]).toBe(3)
  })

  it("does not include non-enumerable explain()", () => {
    const env = makeEnv()
    const json = JSON.stringify(env)
    expect(json).not.toContain("explain")
  })

  it("roundtrips correctly", () => {
    const env = makeEnv()
    const roundtripped = JSON.parse(JSON.stringify(env)) as Record<string, unknown>
    expect(roundtripped).toEqual({
      HOST: "localhost",
      PORT: 3000,
      DEBUG: false,
      API_URL: "https://api.example.com",
      ADMIN_EMAIL: "admin@example.com",
      MAX_RETRIES: 3
    })
  })
})

// ---------------------------------------------------------------------------
// Spread
// ---------------------------------------------------------------------------
describe("spread", () => {
  it("copies all properties", () => {
    const env = makeEnv()
    const copy = { ...env }
    expect(copy).toEqual({
      HOST: "localhost",
      PORT: 3000,
      DEBUG: false,
      API_URL: "https://api.example.com",
      ADMIN_EMAIL: "admin@example.com",
      MAX_RETRIES: 3
    })
  })

  it("does not include non-enumerable explain()", () => {
    const env = makeEnv()
    const copy = { ...env }
    expect(copy).not.toHaveProperty("explain")
  })

  it("allows merging with additional properties", () => {
    const env = makeEnv()
    const merged = { ...env, EXTRA: "value" }
    expect(merged.HOST).toBe("localhost")
    expect(merged.EXTRA).toBe("value")
  })

  it("produces mutable copy — spread result is not frozen", () => {
    const env = makeEnv()
    const copy = { ...env } as Record<string, unknown>
    copy["HOST"] = "changed"
    expect(copy["HOST"]).toBe("changed")
    expect(env.HOST).toBe("localhost")
  })
})

// ---------------------------------------------------------------------------
// Object.keys / Object.entries / Object.values
// ---------------------------------------------------------------------------
describe("Object enumeration", () => {
  it("Object.keys returns all schema keys", () => {
    const env = makeEnv()
    const keys = Object.keys(env)
    expect(keys).toEqual(["HOST", "PORT", "DEBUG", "API_URL", "ADMIN_EMAIL", "MAX_RETRIES"])
  })

  it("Object.entries returns all key-value pairs", () => {
    const env = makeEnv()
    const entries = Object.entries(env)
    expect(entries).toEqual([
      ["HOST", "localhost"],
      ["PORT", 3000],
      ["DEBUG", false],
      ["API_URL", "https://api.example.com"],
      ["ADMIN_EMAIL", "admin@example.com"],
      ["MAX_RETRIES", 3]
    ])
  })

  it("Object.values returns all values", () => {
    const env = makeEnv()
    const values = Object.values(env)
    expect(values).toEqual([
      "localhost",
      3000,
      false,
      "https://api.example.com",
      "admin@example.com",
      3
    ])
  })

  it("Object.keys does NOT include explain", () => {
    const env = makeEnv()
    expect(Object.keys(env)).not.toContain("explain")
  })
})
