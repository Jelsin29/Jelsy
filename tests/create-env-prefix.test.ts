import { describe, it, expect } from "vitest"
import { createEnv, string, number, port } from "../src/index.js"
import { JelsyError } from "../src/errors.js"
import type { EnvExplainEntry } from "../src/types.js"

const getExplain = (env: unknown): EnvExplainEntry[] =>
  (env as { explain: () => EnvExplainEntry[] }).explain()

describe("createEnv — prefix option", () => {
  // SPEC-20: reads prefixed key (MYAPP_PORT -> PORT), returns unprefixed result
  it("reads prefixed key from env and returns unprefixed result key", () => {
    const env = createEnv(
      { PORT: port() },
      { env: { MYAPP_PORT: "3000" }, prefix: "MYAPP_" }
    )

    expect(env.PORT).toBe(3000)
    expect(Object.keys(env)).toEqual(["PORT"])
  })

  // SPEC-21a: prefix applied to ALL schema keys
  it("applies prefix to all schema keys", () => {
    const env = createEnv(
      {
        HOST: string(),
        PORT: port(),
        COUNT: number()
      },
      {
        env: { APP_HOST: "localhost", APP_PORT: "8080", APP_COUNT: "5" },
        prefix: "APP_"
      }
    )

    expect(env.HOST).toBe("localhost")
    expect(env.PORT).toBe(8080)
    expect(env.COUNT).toBe(5)
  })

  // SPEC-21b: unprefixed key in env NOT found when prefix set -> throws missing
  it("throws missing when env has unprefixed key but prefix is set", () => {
    try {
      createEnv(
        { PORT: port() },
        { env: { PORT: "3000" }, prefix: "MYAPP_" }
      )
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(JelsyError)
      const jelsyErr = err as JelsyError
      expect(jelsyErr.errors["PORT"]!.kind).toBe("missing")
    }
  })

  // works with multiple validators and prefix
  it("works with multiple validators and prefix", () => {
    const env = createEnv(
      {
        HOST: string(),
        PORT: port(),
        DEBUG: string({ default: "false" })
      },
      {
        env: { SVC_HOST: "0.0.0.0", SVC_PORT: "9090" },
        prefix: "SVC_"
      }
    )

    expect(env.HOST).toBe("0.0.0.0")
    expect(env.PORT).toBe(9090)
    expect(env.DEBUG).toBe("false")
  })

  // prefix + explain() shows correct provenance (source: "env")
  it("explain() reports source 'env' for prefixed keys", () => {
    const env = createEnv(
      { PORT: port() },
      { env: { X_PORT: "4000" }, prefix: "X_" }
    )

    const entries = getExplain(env)
    expect(entries).toHaveLength(1)
    expect(entries[0]!.key).toBe("PORT")
    expect(entries[0]!.source).toBe("env")
    expect(entries[0]!.value).toBe(4000)
  })

  // no prefix (undefined) reads keys directly
  it("reads keys directly when prefix is undefined", () => {
    const env = createEnv(
      { HOST: string() },
      { env: { HOST: "localhost" } }
    )

    expect(env.HOST).toBe("localhost")
  })

  // empty string prefix behaves as no prefix
  it("empty string prefix behaves as no prefix", () => {
    const env = createEnv(
      { HOST: string() },
      { env: { HOST: "localhost" }, prefix: "" }
    )

    expect(env.HOST).toBe("localhost")
  })

  // prefix + default: prefixed key missing -> default kicks in
  it("uses default when prefixed key is missing", () => {
    const env = createEnv(
      { PORT: port({ default: 3000 }) },
      { env: {}, prefix: "MYAPP_" }
    )

    expect(env.PORT).toBe(3000)
  })

  // prefix does NOT apply to NODE_ENV lookup
  it("prefix does not apply to NODE_ENV lookup", () => {
    const env = createEnv(
      { SECRET: string({ devDefault: "dev-secret" }) },
      { env: { NODE_ENV: "development", APP_SECRET: "prod-secret" }, prefix: "APP_" }
    )

    // NODE_ENV is read WITHOUT prefix, so devDefault is NOT used (env value wins)
    expect(env.SECRET).toBe("prod-secret")
  })
})
