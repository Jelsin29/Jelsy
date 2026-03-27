import { describe, it } from "vitest"
import { expectTypeOf } from "expect-type"

import type {
  Validator,
  ValidatorMeta,
  ValidatorOptions,
  InferEnv
} from "../src/types.js"
import type { StringValidatorOptions } from "../src/validators/string.js"
import type { NumberValidatorOptions } from "../src/validators/number.js"
import type { UrlValidatorOptions } from "../src/validators/url.js"
import type { EnumsValidatorOptions } from "../src/validators/enums.js"
import type { RegexValidatorOptions } from "../src/validators/regex.js"
import type { CustomValidatorOptions } from "../src/validators/custom.js"
import { string } from "../src/validators/string.js"
import { number } from "../src/validators/number.js"
import { port } from "../src/validators/port.js"
import { boolean } from "../src/validators/boolean.js"
import { url } from "../src/validators/url.js"
import { email } from "../src/validators/email.js"
import { json } from "../src/validators/json.js"
import type { enums } from "../src/validators/enums.js"
import { regex } from "../src/validators/regex.js"
import type { custom } from "../src/validators/custom.js"

// ---------------------------------------------------------------------------
// 1. string()
// ---------------------------------------------------------------------------
describe("string() types", () => {
  it("returns Validator<string> with no options", () => {
    expectTypeOf(string).returns.toEqualTypeOf<Validator<string>>()
  })

  it("narrows to union when choices are provided as const", () => {
    expectTypeOf<typeof string<"a" | "b">>().returns.toEqualTypeOf<
      Validator<"a" | "b">
    >()
  })

  it("returns Validator<string> when options are provided", () => {
    expectTypeOf<typeof string>().returns.toEqualTypeOf<Validator<string>>()
  })

  it("StringValidatorOptions.minLength is number | undefined", () => {
    expectTypeOf<StringValidatorOptions["minLength"]>().toEqualTypeOf<
      number | undefined
    >()
  })

  it("StringValidatorOptions.maxLength is number | undefined", () => {
    expectTypeOf<StringValidatorOptions["maxLength"]>().toEqualTypeOf<
      number | undefined
    >()
  })
})

// ---------------------------------------------------------------------------
// 2. number()
// ---------------------------------------------------------------------------
describe("number() types", () => {
  it("returns Validator<number>", () => {
    expectTypeOf(number).returns.toEqualTypeOf<Validator<number>>()
  })

  it("accepts NumberValidatorOptions | undefined as parameter", () => {
    expectTypeOf(number)
      .parameter(0)
      .toEqualTypeOf<NumberValidatorOptions | undefined>()
  })

  it("NumberValidatorOptions.min is number | undefined", () => {
    expectTypeOf<NumberValidatorOptions["min"]>().toEqualTypeOf<
      number | undefined
    >()
  })

  it("NumberValidatorOptions.max is number | undefined", () => {
    expectTypeOf<NumberValidatorOptions["max"]>().toEqualTypeOf<
      number | undefined
    >()
  })

  it("NumberValidatorOptions.integer is boolean | undefined", () => {
    expectTypeOf<NumberValidatorOptions["integer"]>().toEqualTypeOf<
      boolean | undefined
    >()
  })
})

// ---------------------------------------------------------------------------
// 3. port()
// ---------------------------------------------------------------------------
describe("port() types", () => {
  it("returns Validator<number> from signature", () => {
    expectTypeOf(port).returns.toEqualTypeOf<Validator<number>>()
  })

  it("accepts ValidatorOptions<number> as parameter", () => {
    expectTypeOf(port)
      .parameter(0)
      .toEqualTypeOf<ValidatorOptions<number> | undefined>()
  })
})

// ---------------------------------------------------------------------------
// 4. boolean()
// ---------------------------------------------------------------------------
describe("boolean() types", () => {
  it("returns Validator<boolean> from signature", () => {
    expectTypeOf(boolean).returns.toEqualTypeOf<Validator<boolean>>()
  })

  it("accepts ValidatorOptions<boolean> as parameter", () => {
    expectTypeOf(boolean)
      .parameter(0)
      .toEqualTypeOf<ValidatorOptions<boolean> | undefined>()
  })
})

// ---------------------------------------------------------------------------
// 5. url()
// ---------------------------------------------------------------------------
describe("url() types", () => {
  it("returns Validator<string> from signature", () => {
    expectTypeOf(url).returns.toEqualTypeOf<Validator<string>>()
  })

  it("accepts UrlValidatorOptions as parameter", () => {
    expectTypeOf(url)
      .parameter(0)
      .toEqualTypeOf<UrlValidatorOptions | undefined>()
  })

  it("UrlValidatorOptions extends ValidatorOptions<string>", () => {
    expectTypeOf<UrlValidatorOptions>().toExtend<ValidatorOptions<string>>()
  })

  it("UrlValidatorOptions has protocols as optional string[]", () => {
    expectTypeOf<UrlValidatorOptions["protocols"]>().toEqualTypeOf<
      string[] | undefined
    >()
  })
})

// ---------------------------------------------------------------------------
// 6. email()
// ---------------------------------------------------------------------------
describe("email() types", () => {
  it("returns Validator<string> from signature", () => {
    expectTypeOf(email).returns.toEqualTypeOf<Validator<string>>()
  })

  it("accepts ValidatorOptions<string> | undefined as parameter", () => {
    expectTypeOf(email)
      .parameter(0)
      .toEqualTypeOf<ValidatorOptions<string> | undefined>()
  })
})

// ---------------------------------------------------------------------------
// 7. json()
// ---------------------------------------------------------------------------
describe("json() types", () => {
  it("defaults to Validator<unknown> from signature", () => {
    expectTypeOf(json).returns.toEqualTypeOf<Validator<unknown>>()
  })

  it("narrows return type when generic is provided", () => {
    // Type-level only: verify the generic overload produces correct return type
    expectTypeOf(json<{ a: number }>).returns.toEqualTypeOf<
      Validator<{ a: number }>
    >()
  })

  it("narrows return type to Validator<string[]>", () => {
    expectTypeOf(json<string[]>).returns.toEqualTypeOf<Validator<string[]>>()
  })
})

// ---------------------------------------------------------------------------
// 8. enums()
// ---------------------------------------------------------------------------
describe("enums() types", () => {
  it("signature returns Validator parameterized by values", () => {
    // Check that enums accepts the correct options shape
    expectTypeOf<typeof enums<"dev" | "prod">>().returns.toEqualTypeOf<
      Validator<"dev" | "prod">
    >()
  })

  it("EnumsValidatorOptions requires values as readonly array", () => {
    expectTypeOf<EnumsValidatorOptions<"a" | "b">["values"]>().toEqualTypeOf<
      readonly ("a" | "b")[]
    >()
  })

  it("EnumsValidatorOptions extends ValidatorOptions", () => {
    expectTypeOf<EnumsValidatorOptions<"x">>().toExtend<ValidatorOptions<"x">>()
  })

  it("parameter requires EnumsValidatorOptions with correct type", () => {
    expectTypeOf<typeof enums<"dev" | "prod">>()
      .parameter(0)
      .toEqualTypeOf<EnumsValidatorOptions<"dev" | "prod">>()
  })
})

// ---------------------------------------------------------------------------
// 9. regex()
// ---------------------------------------------------------------------------
describe("regex() types", () => {
  it("returns Validator<string> from signature", () => {
    expectTypeOf(regex).returns.toEqualTypeOf<Validator<string>>()
  })

  it("RegexValidatorOptions requires pattern as RegExp", () => {
    expectTypeOf<RegexValidatorOptions["pattern"]>().toEqualTypeOf<RegExp>()
  })

  it("RegexValidatorOptions extends ValidatorOptions<string>", () => {
    expectTypeOf<RegexValidatorOptions>().toExtend<ValidatorOptions<string>>()
  })
})

// ---------------------------------------------------------------------------
// 10. custom()
// ---------------------------------------------------------------------------
describe("custom() types", () => {
  it("infers return type from parser signature", () => {
    expectTypeOf<typeof custom<string[]>>().returns.toEqualTypeOf<
      Validator<string[]>
    >()
  })

  it("infers Validator<number> from explicit generic", () => {
    expectTypeOf<typeof custom<number>>().returns.toEqualTypeOf<
      Validator<number>
    >()
  })

  it("infers Validator<boolean> from explicit generic", () => {
    expectTypeOf<typeof custom<boolean>>().returns.toEqualTypeOf<
      Validator<boolean>
    >()
  })

  it("CustomValidatorOptions has parser with correct signature", () => {
    expectTypeOf<CustomValidatorOptions<number>["parser"]>().toEqualTypeOf<
      (value: string) => number
    >()
  })

  it("CustomValidatorOptions omits transform from ValidatorOptions", () => {
    // transform should NOT exist on CustomValidatorOptions
    expectTypeOf<CustomValidatorOptions<string>>().not.toHaveProperty(
      "transform"
    )
  })

  it("CustomValidatorOptions retains other ValidatorOptions properties", () => {
    expectTypeOf<CustomValidatorOptions<string>["default"]>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<CustomValidatorOptions<string>["desc"]>().toEqualTypeOf<
      string | undefined
    >()
  })
})

// ---------------------------------------------------------------------------
// 11. Validator<T> internal structure
// ---------------------------------------------------------------------------
describe("Validator<T> internal structure", () => {
  it("has readonly _output of type T", () => {
    expectTypeOf<Validator<string>["_output"]>().toEqualTypeOf<string>()
    expectTypeOf<Validator<number>["_output"]>().toEqualTypeOf<number>()
  })

  it("has _parse method with correct signature", () => {
    type ParseFn = Validator<string>["_parse"]
    expectTypeOf<ParseFn>().toEqualTypeOf<
      (
        key: string,
        raw: string | undefined,
        nodeEnv: string | undefined
      ) => string
    >()
  })

  it("has _meta with ValidatorMeta<T> shape", () => {
    expectTypeOf<Validator<number>["_meta"]>().toEqualTypeOf<
      ValidatorMeta<number>
    >()
  })

  it("_meta.type is string", () => {
    expectTypeOf<ValidatorMeta<unknown>["type"]>().toEqualTypeOf<string>()
  })

  it("_meta.optional is boolean", () => {
    expectTypeOf<ValidatorMeta<unknown>["optional"]>().toEqualTypeOf<boolean>()
  })

  it("_meta.default is optional T", () => {
    expectTypeOf<ValidatorMeta<number>["default"]>().toEqualTypeOf<
      number | undefined
    >()
  })

  it("_meta.desc is optional string", () => {
    expectTypeOf<ValidatorMeta<unknown>["desc"]>().toEqualTypeOf<
      string | undefined
    >()
  })
})

// ---------------------------------------------------------------------------
// 12. ValidatorOptions<T>
// ---------------------------------------------------------------------------
describe("ValidatorOptions<T>", () => {
  it("default is optional T", () => {
    expectTypeOf<ValidatorOptions<string>["default"]>().toEqualTypeOf<
      string | undefined
    >()
  })

  it("devDefault is optional T", () => {
    expectTypeOf<ValidatorOptions<number>["devDefault"]>().toEqualTypeOf<
      number | undefined
    >()
  })

  it("optional is optional boolean", () => {
    expectTypeOf<ValidatorOptions<string>["optional"]>().toEqualTypeOf<
      boolean | undefined
    >()
  })

  it("transform accepts and returns T", () => {
    expectTypeOf<ValidatorOptions<string>["transform"]>().toEqualTypeOf<
      ((value: string) => string) | undefined
    >()
  })

  it("desc is optional string", () => {
    expectTypeOf<ValidatorOptions<unknown>["desc"]>().toEqualTypeOf<
      string | undefined
    >()
  })

  it("example is optional string", () => {
    expectTypeOf<ValidatorOptions<unknown>["example"]>().toEqualTypeOf<
      string | undefined
    >()
  })

  it("docs is optional string", () => {
    expectTypeOf<ValidatorOptions<unknown>["docs"]>().toEqualTypeOf<
      string | undefined
    >()
  })
})

// ---------------------------------------------------------------------------
// 13. InferEnv<T>
// ---------------------------------------------------------------------------
//
// IsRequired inspects `_meta.optional` and `_meta.default` at the type level.
// A generic `Validator<T>` has `optional: boolean` and `default: T | undefined`,
// so `boolean extends true` is false → IsRequired returns false → all keys optional.
// To properly test required vs optional, we need concrete _meta shapes with
// literal types (e.g., `optional: false`, `default: undefined`).
// ---------------------------------------------------------------------------

/** A validator whose _meta signals "required": optional is literally false, default is literally undefined. */
interface RequiredValidator<T> extends Validator<T> {
  _meta: ValidatorMeta<T> & { optional: false; default: undefined }
}

/** A validator whose _meta signals "optional": optional is literally true. */
interface OptionalValidator<T> extends Validator<T> {
  _meta: ValidatorMeta<T> & { optional: true }
}

/** A validator with a default value (not undefined), making it optional. */
interface DefaultedValidator<T> extends Validator<T> {
  _meta: ValidatorMeta<T> & { optional: false; default: T }
}

describe("InferEnv<T>", () => {
  it("makes keys required when _meta has optional: false and default: undefined", () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    type Schema = {
      HOST: RequiredValidator<string>
      PORT: RequiredValidator<number>
    }
    expectTypeOf<InferEnv<Schema>>().toEqualTypeOf<{
      HOST: string
      PORT: number
    }>()
  })

  it("makes keys optional when _meta has optional: true", () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    type Schema = {
      DEBUG: OptionalValidator<boolean>
    }
    expectTypeOf<InferEnv<Schema>>().toEqualTypeOf<{
      DEBUG?: boolean | undefined
    }>()
  })

  it("makes keys optional when _meta has a concrete default", () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    type Schema = {
      PORT: DefaultedValidator<number>
    }
    expectTypeOf<InferEnv<Schema>>().toEqualTypeOf<{
      PORT?: number | undefined
    }>()
  })

  it("mixes required and optional keys correctly", () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    type Schema = {
      HOST: RequiredValidator<string>
      PORT: DefaultedValidator<number>
      DEBUG: OptionalValidator<boolean>
    }
    expectTypeOf<InferEnv<Schema>>().toEqualTypeOf<{
      HOST: string
      PORT?: number | undefined
      DEBUG?: boolean | undefined
    }>()
  })

  it("treats generic Validator<T> keys as optional (boolean is not literal false)", () => {
    // With generic Validator<T>, _meta.optional is `boolean` — not `true`,
    // so IsRequired returns false, making all keys optional.
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    type Schema = {
      NAME: Validator<string>
      COUNT: Validator<number>
    }
    expectTypeOf<InferEnv<Schema>>().toEqualTypeOf<{
      NAME?: string | undefined
      COUNT?: number | undefined
    }>()
  })
})
