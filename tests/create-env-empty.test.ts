import { describe, it, expect } from "vitest"
import { createEnv, string, port } from "../src/index.js"
import { JelsyError } from "../src/errors.js"

describe("createEnv — emptyStringAsUndefined", () => {
  // SPEC-22: default true -> empty string treated as missing -> throws JelsyError
  it("treats empty string as missing by default (true) and throws", () => {
    try {
      createEnv(
        { HOST: string() },
        { env: { HOST: "" } }
      )
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(JelsyError)
      const jelsyErr = err as JelsyError
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(jelsyErr.errors["HOST"]!.kind).toBe("missing")
    }
  })

  // SPEC-23a: set to false -> empty string passed through to validator
  it("passes empty string to validator when set to false", () => {
    try {
      createEnv(
        { HOST: string() },
        { env: { HOST: "" }, emptyStringAsUndefined: false }
      )
      expect.unreachable("should have thrown — string() requires minLength 1")
    } catch (err) {
      expect(err).toBeInstanceOf(JelsyError)
      const jelsyErr = err as JelsyError
      // The error is "invalid" (not "missing") because the empty string IS passed through
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(jelsyErr.errors["HOST"]!.kind).toBe("invalid")
    }
  })

  // SPEC-23b: false + string(minLength:0) -> accepts empty string
  it("accepts empty string when false and validator allows it", () => {
    const env = createEnv(
      { HOST: string({ minLength: 0 }) },
      { env: { HOST: "" }, emptyStringAsUndefined: false }
    )

    expect(env.HOST).toBe("")
  })

  // SPEC-24: empty string + default when true -> default kicks in
  it("uses default when empty string is treated as undefined", () => {
    const env = createEnv(
      { HOST: string({ default: "fallback" }) },
      { env: { HOST: "" }, emptyStringAsUndefined: true }
    )

    expect(env.HOST).toBe("fallback")
  })

  // explicit true behaves same as default
  it("explicit true behaves the same as omitting the option", () => {
    try {
      createEnv(
        { HOST: string() },
        { env: { HOST: "" }, emptyStringAsUndefined: true }
      )
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(JelsyError)
      const jelsyErr = err as JelsyError
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(jelsyErr.errors["HOST"]!.kind).toBe("missing")
    }
  })

  // empty string with optional var + true -> returns undefined
  it("returns undefined for optional var with empty string when true", () => {
    const env = createEnv(
      { OPT: string({ optional: true }) },
      { env: { OPT: "" }, emptyStringAsUndefined: true }
    )

    expect(env.OPT).toBeUndefined()
  })

  // empty string with devDefault + true -> devDefault kicks in (NODE_ENV != production)
  it("uses devDefault when empty string is treated as undefined in non-production", () => {
    const env = createEnv(
      { SECRET: string({ devDefault: "dev-secret" }) },
      { env: { NODE_ENV: "development", SECRET: "" }, emptyStringAsUndefined: true }
    )

    expect(env.SECRET).toBe("dev-secret")
  })

  // interaction with prefix: prefixed key has empty string + true -> treated as missing
  it("treats prefixed empty string as missing when true", () => {
    try {
      createEnv(
        { PORT: port() },
        { env: { APP_PORT: "" }, prefix: "APP_", emptyStringAsUndefined: true }
      )
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(JelsyError)
      const jelsyErr = err as JelsyError
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(jelsyErr.errors["PORT"]!.kind).toBe("missing")
    }
  })
})
