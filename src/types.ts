// TODO: Implement full type system

export interface ValidatorMeta<T> {
  type: string
  default?: T
  devDefault?: T
  optional: boolean
  desc?: string
  example?: string
  docs?: string
}

export interface Validator<T> {
  readonly _output: T
  readonly _optional: boolean
  _parse: (
    key: string,
    raw: string | undefined,
    nodeEnv: string | undefined
  ) => T
  _meta: ValidatorMeta<T>
}

export interface ValidatorOptions<T> {
  default?: T
  devDefault?: T
  desc?: string
  example?: string
  docs?: string
  optional?: boolean
  transform?: (value: T) => T
}

export interface CreateEnvOptions {
  env?: Record<string, string | undefined>
  reporter?: Reporter
  prefix?: string
  emptyStringAsUndefined?: boolean
}

export interface ValidationError {
  key: string
  kind: "missing" | "invalid"
  message: string
  received?: string
  desc?: string
  example?: string
}

export interface ValidationReport {
  errors: Record<string, ValidationError>
  env: Record<string, string | undefined>
}

export type Reporter = (report: ValidationReport) => void

export interface EnvExplainEntry {
  key: string
  value: unknown
  source: "env" | "default" | "devDefault"
  type: string
  desc?: string
}

// TODO: Implement EnvSchema, InferEnv, IsRequired, Simplify
export type EnvSchema = Record<string, Validator<unknown>>

export type InferEnv<TSchema extends EnvSchema> = {
  [K in keyof TSchema]: TSchema[K]["_output"]
}
