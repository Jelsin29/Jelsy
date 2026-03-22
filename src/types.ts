// ---------------------------------------------------------------------------
// Jelsy — Type System
// ---------------------------------------------------------------------------

// -- Utility types ----------------------------------------------------------

/**
 * Flattens an intersection of object types into a single object type.
 * Makes IDE tooltips readable instead of showing `A & B`.
 */
export type Simplify<T> = { [K in keyof T]: T[K] } & {}

// -- Validator metadata -----------------------------------------------------

export interface ValidatorMeta<T> {
  type: string
  default?: T
  devDefault?: T
  optional: boolean
  desc?: string
  example?: string
  docs?: string
}

// -- Core Validator interface -----------------------------------------------

export interface Validator<T> {
  /** Phantom type — never assigned at runtime. Carries the output type. */
  readonly _output: T
  /** @internal — called by createEnv to parse and validate a single variable. */
  _parse: (
    key: string,
    raw: string | undefined,
    nodeEnv: string | undefined
  ) => T
  /** @internal — metadata for error reporting and explain(). */
  _meta: ValidatorMeta<T>
}

// -- Validator options (shared by all validators) ---------------------------

export interface ValidatorOptions<T> {
  /** Fallback value if env var is not set. Makes the var optional. */
  default?: T
  /** Fallback value used only when NODE_ENV !== 'production'. */
  devDefault?: T
  /** Human-readable description (shown in error table and explain()). */
  desc?: string
  /** Example value (shown in error output). */
  example?: string
  /** URL to docs about this env var. */
  docs?: string
  /**
   * Mark as explicitly optional. Returns `T | undefined`.
   * Different from `default: undefined` — this communicates intent.
   */
  optional?: boolean
  /** Transform the validated value. Runs AFTER validation. */
  transform?: (value: T) => T
}

// -- Schema -----------------------------------------------------------------

export type EnvSchema = Record<string, Validator<unknown>>

// -- Type-level inference ---------------------------------------------------

/**
 * Determines whether a validator produces a REQUIRED key in the inferred env.
 *
 * A key is required when:
 *   - The validator is NOT marked `optional: true`
 *   - AND the validator has NO `default` value
 *
 * `devDefault` alone does NOT make a key optional — it only provides a fallback
 * in non-production environments, so the key is still required in prod.
 */
type IsRequired<V> =
  V extends Validator<unknown>
    ? V["_meta"]["optional"] extends true
      ? false
      : V["_meta"]["default"] extends undefined
        ? true
        : false
    : false

/**
 * Extracts the keys from a schema where the validator is required.
 */
type RequiredKeys<S extends EnvSchema> = {
  [K in keyof S]: IsRequired<S[K]> extends true ? K : never
}[keyof S]

/**
 * Extracts the keys from a schema where the validator is optional
 * (has a default or is marked optional).
 */
type OptionalKeys<S extends EnvSchema> = {
  [K in keyof S]: IsRequired<S[K]> extends true ? never : K
}[keyof S]

/**
 * Infers the final environment object type from a schema.
 *
 * - Required keys → `T` (must be present, no `?` modifier)
 * - Optional keys → `T | undefined` with `?` modifier
 *
 * Uses `Simplify` to flatten the intersection into a single object type
 * so IDE tooltips show the actual shape.
 */
export type InferEnv<TSchema extends EnvSchema> = Simplify<
  { [K in RequiredKeys<TSchema>]: TSchema[K]["_output"] } & {
    [K in OptionalKeys<TSchema>]?: TSchema[K]["_output"] | undefined
  }
>

// -- createEnv options ------------------------------------------------------

export interface CreateEnvOptions {
  /** Override the environment source. Defaults to `process.env`. */
  env?: Record<string, string | undefined>
  /** Custom error reporter. Defaults to table format on stderr + process.exit(1). */
  reporter?: Reporter
  /**
   * Prefix to strip from env var names.
   * e.g., `prefix: 'MYAPP_'` means schema key `PORT` reads `MYAPP_PORT` from env.
   */
  prefix?: string
  /**
   * Treat empty strings as undefined (missing).
   * Default: `true` (opinionated — empty string is almost never intentional).
   */
  emptyStringAsUndefined?: boolean
}

// -- Validation errors ------------------------------------------------------

export interface ValidationError {
  /** The env var name. */
  key: string
  /** Whether the variable was missing or had an invalid value. */
  kind: "missing" | "invalid"
  /** Human-readable error message. */
  message: string
  /** The raw value received (undefined if missing). */
  received?: string
  /** Description from the validator spec, if provided. */
  desc?: string
  /** Example value from the validator spec, if provided. */
  example?: string
}

export interface ValidationReport {
  /** All validation errors keyed by variable name. */
  errors: Record<string, ValidationError>
  /** The raw env object that was validated against. */
  env: Record<string, string | undefined>
}

// -- Reporter ---------------------------------------------------------------

export type Reporter = (report: ValidationReport) => void

// -- explain() --------------------------------------------------------------

export interface EnvExplainEntry {
  /** The env var name. */
  key: string
  /** The resolved value. */
  value: unknown
  /** Where the value came from. */
  source: "env" | "default" | "devDefault"
  /** The validator type name (e.g., 'string', 'port', 'url'). */
  type: string
  /** Description from the validator spec, if provided. */
  desc?: string
}
