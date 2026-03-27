import { describe, it, expect } from "vitest"
import { createEnv, string, number, port, boolean, url, enums, json } from "../src/index.js"
import { JelsyError } from "../src/errors.js"

// ---------------------------------------------------------------------------
// Edge case: empty env (all defaults)
// ---------------------------------------------------------------------------
describe("empty env — all defaults", () => {
  it("works when all validators have defaults and env is empty", () => {
    const env = createEnv(
      {
        HOST: string({ default: "localhost" }),
        PORT: port({ default: 3000 }),
        DEBUG: boolean({ default: false }),
        MAX: number({ default: 10 })
      },
      { env: {} }
    )
    expect(env.HOST).toBe("localhost")
    expect(env.PORT).toBe(3000)
    expect(env.DEBUG).toBe(false)
    expect(env.MAX).toBe(10)
  })

  it("works with devDefaults in non-production", () => {
    const env = createEnv(
      {
        SECRET: string({ devDefault: "dev-secret" }),
        DB_URL: url({ devDefault: "https://localhost:5432/dev" })
      },
      { env: { NODE_ENV: "development" } }
    )
    expect(env.SECRET).toBe("dev-secret")
    expect(env.DB_URL).toBe("https://localhost:5432/dev")
  })

  it("throws when env is empty and required vars have no defaults", () => {
    expect(() =>
      createEnv(
        { REQUIRED: string() },
        { env: {} }
      )
    ).toThrow(JelsyError)
  })
})

// ---------------------------------------------------------------------------
// Edge case: all values from env (no defaults used)
// ---------------------------------------------------------------------------
describe("all values from env", () => {
  it("reads all values from env source", () => {
    const env = createEnv(
      {
        HOST: string(),
        PORT: port(),
        DEBUG: boolean()
      },
      { env: { HOST: "prod.example.com", PORT: "8080", DEBUG: "true" } }
    )
    expect(env.HOST).toBe("prod.example.com")
    expect(env.PORT).toBe(8080)
    expect(env.DEBUG).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Edge case: browser environment (no process global)
// ---------------------------------------------------------------------------
describe("browser environment (no process)", () => {
  it("works with explicit env option when process is not available", () => {
    // Simulate browser: pass env explicitly
    const env = createEnv(
      {
        API_URL: url(),
        APP_NAME: string({ default: "MyApp" })
      },
      {
        env: { API_URL: "https://api.example.com" } as Record<string, string | undefined>
      }
    )
    expect(env.API_URL).toBe("https://api.example.com")
    expect(env.APP_NAME).toBe("MyApp")
  })
})

// ---------------------------------------------------------------------------
// Edge case: schema composition via spread
// ---------------------------------------------------------------------------
describe("schema composition via spread", () => {
  it("supports shared schema via object spread", () => {
    const shared = {
      NODE_ENV: enums({ values: ["development", "production"] as const }),
      LOG_LEVEL: enums({
        values: ["debug", "info", "warn", "error"] as const,
        default: "info" as const
      })
    }

    const env = createEnv(
      {
        ...shared,
        PORT: port({ default: 3000 })
      },
      { env: { NODE_ENV: "production" } }
    )

    expect(env.NODE_ENV).toBe("production")
    expect(env.LOG_LEVEL).toBe("info")
    expect(env.PORT).toBe(3000)
  })
})

// ---------------------------------------------------------------------------
// Edge case: multiple errors collected
// ---------------------------------------------------------------------------
describe("multiple errors collected", () => {
  it("collects all errors in a single throw", () => {
    try {
      createEnv(
        {
          A: string(),
          B: port(),
          C: url(),
          D: boolean()
        },
        { env: {} }
      )
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(JelsyError)
      const jelsyErr = err as JelsyError
      expect(Object.keys(jelsyErr.errors)).toHaveLength(4)
      expect(jelsyErr.errors["A"]!.kind).toBe("missing")
      expect(jelsyErr.errors["B"]!.kind).toBe("missing")
      expect(jelsyErr.errors["C"]!.kind).toBe("missing")
      expect(jelsyErr.errors["D"]!.kind).toBe("missing")
    }
  })
})

// ---------------------------------------------------------------------------
// Edge case: json validator with complex types
// ---------------------------------------------------------------------------
describe("json validator edge cases", () => {
  it("parses nested JSON objects", () => {
    const env = createEnv(
      {
        CONFIG: json<{ nested: { deep: boolean } }>()
      },
      { env: { CONFIG: '{"nested":{"deep":true}}' } }
    )
    expect(env.CONFIG).toEqual({ nested: { deep: true } })
  })

  it("parses JSON arrays", () => {
    const env = createEnv(
      {
        ITEMS: json<string[]>()
      },
      { env: { ITEMS: '["a","b","c"]' } }
    )
    expect(env.ITEMS).toEqual(["a", "b", "c"])
  })
})

// ---------------------------------------------------------------------------
// Edge case: optional vars with undefined
// ---------------------------------------------------------------------------
describe("optional vars", () => {
  it("returns undefined for optional vars not in env", () => {
    const env = createEnv(
      {
        OPTIONAL_VAR: string({ optional: true })
      },
      { env: {} }
    )
    expect(env.OPTIONAL_VAR).toBeUndefined()
  })

  it("returns value for optional vars that ARE in env", () => {
    const env = createEnv(
      {
        OPTIONAL_VAR: string({ optional: true })
      },
      { env: { OPTIONAL_VAR: "present" } }
    )
    expect(env.OPTIONAL_VAR).toBe("present")
  })
})
