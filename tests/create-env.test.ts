import { describe, it, expect, vi } from "vitest"
import { createEnv } from "../src/index.js"
import {
  string,
  number,
  port,
  boolean,
  url
} from "../src/index.js"
import { JelsyError } from "../src/errors.js"
import type { ValidationReport } from "../src/types.js"

describe("createEnv", () => {
  // SPEC-01: happy path — valid env → frozen typed object
  it("returns a frozen typed object for valid env vars", () => {
    const env = createEnv(
      {
        HOST: string(),
        PORT: port(),
        DEBUG: boolean()
      },
      { env: { HOST: "localhost", PORT: "3000", DEBUG: "true" } }
    )

    expect(env.HOST).toBe("localhost")
    expect(env.PORT).toBe(3000)
    expect(env.DEBUG).toBe(true)
    expect(Object.isFrozen(env)).toBe(true)
  })

  // SPEC-04: default values when var missing
  it("uses default values when env var is missing", () => {
    const env = createEnv(
      {
        HOST: string({ default: "0.0.0.0" }),
        PORT: port({ default: 8080 })
      },
      { env: {} }
    )

    expect(env.HOST).toBe("0.0.0.0")
    expect(env.PORT).toBe(8080)
  })

  // SPEC-05: devDefault in non-production
  it("uses devDefault in non-production environments", () => {
    const env = createEnv(
      {
        API_KEY: string({ devDefault: "dev-key-123" })
      },
      { env: { NODE_ENV: "development" } }
    )

    expect(env.API_KEY).toBe("dev-key-123")
  })

  // SPEC-06: devDefault ignored in production → throws
  it("ignores devDefault in production and throws", () => {
    expect(() =>
      createEnv(
        {
          API_KEY: string({ devDefault: "dev-key-123" })
        },
        { env: { NODE_ENV: "production" } }
      )
    ).toThrow(JelsyError)
  })

  // SPEC-07: optional vars → undefined when missing
  it("returns undefined for optional vars when missing", () => {
    const env = createEnv(
      {
        OPTIONAL_VAR: string({ optional: true })
      },
      { env: {} }
    )

    expect(env.OPTIONAL_VAR).toBeUndefined()
  })

  // SPEC-12: custom env source
  it("uses custom env source instead of process.env", () => {
    const customEnv = { MY_VAR: "custom-value" }
    const env = createEnv(
      {
        MY_VAR: string()
      },
      { env: customEnv }
    )

    expect(env.MY_VAR).toBe("custom-value")
  })

  // SPEC-02: single missing → JelsyError
  it("throws JelsyError for a single missing required var", () => {
    try {
      createEnv(
        {
          REQUIRED_VAR: string()
        },
        { env: {} }
      )
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(JelsyError)
      const jelsyErr = err as JelsyError
      expect(jelsyErr.errors["REQUIRED_VAR"]).toBeDefined()
      expect(jelsyErr.errors["REQUIRED_VAR"]!.kind).toBe("missing")
    }
  })

  // SPEC-03: multiple errors ALL collected (missing + invalid)
  it("collects all errors — missing and invalid — in a single throw", () => {
    try {
      createEnv(
        {
          MISSING_VAR: string(),
          BAD_PORT: port(),
          ALSO_MISSING: url()
        },
        { env: { BAD_PORT: "not-a-number" } }
      )
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(JelsyError)
      const jelsyErr = err as JelsyError
      expect(Object.keys(jelsyErr.errors)).toHaveLength(3)
      expect(jelsyErr.errors["MISSING_VAR"]!.kind).toBe("missing")
      expect(jelsyErr.errors["BAD_PORT"]!.kind).toBe("invalid")
      expect(jelsyErr.errors["ALSO_MISSING"]!.kind).toBe("missing")
    }
  })

  // SPEC-08: mutation throws TypeError
  it("throws TypeError when trying to mutate the env object", () => {
    const env = createEnv(
      {
        HOST: string()
      },
      { env: { HOST: "localhost" } }
    )

    expect(() => {
      ;(env as Record<string, unknown>)["HOST"] = "changed"
    }).toThrow(TypeError)
  })

  // SPEC-09: structuredClone works
  it("supports structuredClone", () => {
    const env = createEnv(
      {
        HOST: string(),
        PORT: port()
      },
      { env: { HOST: "localhost", PORT: "3000" } }
    )

    const clone = structuredClone(env)
    expect(clone.HOST).toBe("localhost")
    expect(clone.PORT).toBe(3000)
  })

  // SPEC-10: JSON.stringify works
  it("supports JSON.stringify", () => {
    const env = createEnv(
      {
        HOST: string()
      },
      { env: { HOST: "localhost" } }
    )

    const json = JSON.parse(JSON.stringify(env))
    expect(json.HOST).toBe("localhost")
  })

  // SPEC-11: Object.keys returns schema keys only
  it("Object.keys returns only schema keys (no explain)", () => {
    const env = createEnv(
      {
        HOST: string(),
        PORT: port()
      },
      { env: { HOST: "localhost", PORT: "3000" } }
    )

    expect(Object.keys(env)).toEqual(["HOST", "PORT"])
  })

  // SPEC-13: custom reporter called with ValidationReport
  it("calls custom reporter with ValidationReport before throwing", () => {
    const reporter = vi.fn()

    try {
      createEnv(
        {
          MISSING: string()
        },
        { env: {}, reporter }
      )
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(JelsyError)
    }

    expect(reporter).toHaveBeenCalledOnce()
    const report: ValidationReport = reporter.mock.calls[0]![0]
    expect(report.errors).toBeDefined()
    expect(report.env).toBeDefined()
  })

  // SPEC-14: reporter receives correct shape (desc, example, received)
  it("reporter receives errors with desc, example, and received fields", () => {
    const reporter = vi.fn()

    try {
      createEnv(
        {
          API_URL: url({ desc: "Backend API", example: "https://api.example.com" })
        },
        { env: { API_URL: "not-a-url" }, reporter }
      )
      expect.unreachable("should have thrown")
    } catch {
      // expected
    }

    const report: ValidationReport = reporter.mock.calls[0]![0]
    const error = report.errors["API_URL"]!
    expect(error.desc).toBe("Backend API")
    expect(error.example).toBe("https://api.example.com")
    expect(error.received).toBe("not-a-url")
    expect(error.kind).toBe("invalid")
  })

  // JelsyError thrown even after custom reporter returns
  it("throws JelsyError even when custom reporter does not throw", () => {
    const reporter = vi.fn() // does nothing, returns void

    expect(() =>
      createEnv(
        { MISSING: string() },
        { env: {}, reporter }
      )
    ).toThrow(JelsyError)
  })

  // Custom reporter's thrown exception propagates
  it("propagates custom reporter's thrown exception", () => {
    const customError = new Error("custom reporter error")
    const reporter = vi.fn(() => {
      throw customError
    })

    expect(() =>
      createEnv(
        { MISSING: string() },
        { env: {}, reporter }
      )
    ).toThrow(customError)
  })

  // Empty schema → frozen empty object
  it("returns a frozen empty object for empty schema", () => {
    const env = createEnv({}, { env: {} })

    expect(Object.keys(env)).toEqual([])
    expect(Object.isFrozen(env)).toBe(true)
  })

  // Spread excludes explain
  it("spread operator excludes explain from result", () => {
    const env = createEnv(
      { HOST: string() },
      { env: { HOST: "localhost" } }
    )

    const spread = { ...env }
    expect(spread).toEqual({ HOST: "localhost" })
    expect("explain" in spread).toBe(false)
  })
})
