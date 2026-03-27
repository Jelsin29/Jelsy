import { describe, it, expect } from "vitest"
import { createEnv, string, number, port, boolean } from "../src/index.js"
import { getExplain } from "./helpers.js"

describe("createEnv — explain()", () => {
  // SPEC-15: mixed sources provenance (env + default + devDefault)
  it("reports mixed sources: env, default, and devDefault", () => {
    const env = createEnv(
      {
        HOST: string(),
        PORT: port({ default: 8080 }),
        DEBUG: boolean({ devDefault: true })
      },
      { env: { HOST: "localhost", NODE_ENV: "development" } }
    )

    const entries = getExplain(env)
    expect(entries).toHaveLength(3)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const hostEntry = entries.find((e) => e.key === "HOST")!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const portEntry = entries.find((e) => e.key === "PORT")!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const debugEntry = entries.find((e) => e.key === "DEBUG")!

    expect(hostEntry.source).toBe("env")
    expect(portEntry.source).toBe("default")
    expect(debugEntry.source).toBe("devDefault")
  })

  // SPEC-16: source "env"
  it("reports source 'env' when value comes from environment", () => {
    const env = createEnv(
      { API_URL: string() },
      { env: { API_URL: "https://api.example.com" } }
    )

    const entries = getExplain(env)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.source).toBe("env")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.value).toBe("https://api.example.com")
  })

  // SPEC-17: source "default"
  it("reports source 'default' when value comes from default", () => {
    const env = createEnv(
      { HOST: string({ default: "0.0.0.0" }) },
      { env: {} }
    )

    const entries = getExplain(env)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.source).toBe("default")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.value).toBe("0.0.0.0")
  })

  // SPEC-18: source "devDefault"
  it("reports source 'devDefault' in non-production", () => {
    const env = createEnv(
      { SECRET: string({ devDefault: "dev-secret" }) },
      { env: { NODE_ENV: "development" } }
    )

    const entries = getExplain(env)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.source).toBe("devDefault")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.value).toBe("dev-secret")
  })

  // SPEC-19: non-enumerable (Object.keys, JSON.stringify, spread, getOwnPropertyDescriptor)
  it("explain is non-enumerable — excluded from keys, JSON, spread", () => {
    const env = createEnv(
      { HOST: string() },
      { env: { HOST: "localhost" } }
    )

    // Not in Object.keys
    expect(Object.keys(env)).not.toContain("explain")

    // Not in JSON.stringify
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = JSON.parse(JSON.stringify(env))
    expect(json).not.toHaveProperty("explain")

    // Not in spread
    const spread = { ...env }
    expect(spread).not.toHaveProperty("explain")

    // But exists on the object via getOwnPropertyDescriptor
    const descriptor = Object.getOwnPropertyDescriptor(env, "explain")
    expect(descriptor).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(descriptor!.enumerable).toBe(false)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(descriptor!.writable).toBe(false)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(descriptor!.configurable).toBe(false)
  })

  // source "default" for optional with no value
  it("reports source 'default' for optional vars with no value", () => {
    const env = createEnv(
      { OPT: string({ optional: true }) },
      { env: {} }
    )

    const entries = getExplain(env)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.source).toBe("default")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.value).toBeUndefined()
  })

  // includes desc when present
  it("includes desc in entry when validator has desc", () => {
    const env = createEnv(
      { HOST: string({ desc: "Server hostname" }) },
      { env: { HOST: "localhost" } }
    )

    const entries = getExplain(env)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.desc).toBe("Server hostname")
  })

  // omits desc when absent
  it("omits desc from entry when validator has no desc", () => {
    const env = createEnv(
      { HOST: string() },
      { env: { HOST: "localhost" } }
    )

    const entries = getExplain(env)
    expect(entries[0]).not.toHaveProperty("desc")
  })

  // correct type name per validator
  it("reports correct type name per validator", () => {
    const env = createEnv(
      {
        HOST: string(),
        PORT: port(),
        COUNT: number(),
        VERBOSE: boolean()
      },
      { env: { HOST: "localhost", PORT: "3000", COUNT: "42", VERBOSE: "false" } }
    )

    const entries = getExplain(env)
    const types = Object.fromEntries(entries.map((e) => [e.key, e.type]))

    expect(types["HOST"]).toBe("string")
    expect(types["PORT"]).toBe("port")
    expect(types["COUNT"]).toBe("number")
    expect(types["VERBOSE"]).toBe("boolean")
  })

  // returns copy (mutation safe)
  it("returns a copy — mutations do not affect internal state", () => {
    const env = createEnv(
      { HOST: string() },
      { env: { HOST: "localhost" } }
    )

    const first = getExplain(env)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    first[0]!.value = "MUTATED"

    const second = getExplain(env)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(second[0]!.value).toBe("localhost")
  })

  // emptyStringAsUndefined: empty string → source "default" not "env"
  it("empty string with emptyStringAsUndefined resolves to default, not env", () => {
    const env = createEnv(
      { HOST: string({ default: "fallback" }) },
      { env: { HOST: "" }, emptyStringAsUndefined: true }
    )

    const entries = getExplain(env)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.source).toBe("default")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(entries[0]!.value).toBe("fallback")
  })
})
