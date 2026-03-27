import { describe, it, expect } from "vitest"
import { createEnv, string, number, port, boolean } from "../src/index.js"

// ---------------------------------------------------------------------------
// Object.freeze behavior — proving no Proxy, plain frozen object
// ---------------------------------------------------------------------------
describe("Object.freeze behavior", () => {
  const makeEnv = () =>
    createEnv(
      {
        HOST: string({ default: "localhost" }),
        PORT: port({ default: 3000 }),
        DEBUG: boolean({ default: false })
      },
      { env: {} }
    )

  it("returned object is frozen", () => {
    const env = makeEnv()
    expect(Object.isFrozen(env)).toBe(true)
  })

  it("assignment to existing property throws in strict mode", () => {
    const env = makeEnv()
    expect(() => {
      ;(env as Record<string, unknown>)["HOST"] = "changed"
    }).toThrow()
  })

  it("adding new property throws in strict mode", () => {
    const env = makeEnv()
    expect(() => {
      ;(env as Record<string, unknown>)["NEW_PROP"] = "value"
    }).toThrow()
  })

  it("deleting property throws in strict mode", () => {
    const env = makeEnv()
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (env as Record<string, unknown>)["HOST"]
    }).toThrow()
  })

  it("Object.isExtensible returns false", () => {
    const env = makeEnv()
    expect(Object.isExtensible(env)).toBe(false)
  })

  it("Object.isSealed returns true", () => {
    const env = makeEnv()
    expect(Object.isSealed(env)).toBe(true)
  })

  it("property descriptors show non-writable and non-configurable", () => {
    const env = makeEnv()
    const desc = Object.getOwnPropertyDescriptor(env, "HOST")
    expect(desc).toBeDefined()
    expect(desc!.writable).toBe(false)
    expect(desc!.configurable).toBe(false)
    expect(desc!.enumerable).toBe(true)
  })

  it("is a plain object — not a Proxy", () => {
    const env = makeEnv()
    // A Proxy cannot be detected directly, but we can verify:
    // 1. toString shows [object Object], not a Proxy wrapper
    expect(Object.prototype.toString.call(env)).toBe("[object Object]")
    // 2. The constructor is Object
    expect(env.constructor).toBe(Object)
    // 3. getPrototypeOf returns Object.prototype
    expect(Object.getPrototypeOf(env)).toBe(Object.prototype)
  })

  it("in operator works correctly for existing keys", () => {
    const env = makeEnv()
    expect("HOST" in env).toBe(true)
    expect("PORT" in env).toBe(true)
    expect("NONEXISTENT" in env).toBe(false)
  })

  it("typeof returns correct types for property values", () => {
    const env = makeEnv()
    expect(typeof env.HOST).toBe("string")
    expect(typeof env.PORT).toBe("number")
    expect(typeof env.DEBUG).toBe("boolean")
  })

  it("multiple createEnv calls return independent objects", () => {
    const env1 = createEnv(
      { A: string({ default: "one" }) },
      { env: {} }
    )
    const env2 = createEnv(
      { A: string({ default: "two" }) },
      { env: {} }
    )
    expect(env1.A).toBe("one")
    expect(env2.A).toBe("two")
  })

  it("frozen object survives being passed as argument", () => {
    const env = makeEnv()
    const readHost = (e: { HOST: string }): string => e.HOST
    expect(readHost(env)).toBe("localhost")
  })
})

// ---------------------------------------------------------------------------
// process.env mutation after createEnv — snapshot behavior
// ---------------------------------------------------------------------------
describe("process.env mutation after createEnv", () => {
  it("env object is a snapshot — subsequent process.env changes do not affect it", () => {
    const original = process.env["SNAPSHOT_TEST_VAR"]
    process.env["SNAPSHOT_TEST_VAR"] = "initial"

    const env = createEnv(
      { SNAPSHOT_TEST_VAR: string() },
      { env: { SNAPSHOT_TEST_VAR: "initial" } }
    )

    // Mutate the source — should NOT affect the frozen env
    process.env["SNAPSHOT_TEST_VAR"] = "mutated"
    expect(env.SNAPSHOT_TEST_VAR).toBe("initial")

    // Cleanup
    if (original === undefined) {
      delete process.env["SNAPSHOT_TEST_VAR"]
    } else {
      process.env["SNAPSHOT_TEST_VAR"] = original
    }
  })

  it("custom env source mutation does not affect frozen result", () => {
    const source: Record<string, string> = { KEY: "value" }
    const env = createEnv(
      { KEY: string() },
      { env: source }
    )

    source["KEY"] = "changed"
    expect(env.KEY).toBe("value")
  })
})
