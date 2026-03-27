// Public API
export { createEnv } from "./create-env.js"
export { defaultReporter, formatReportTable } from "./reporter.js"
export {
  string,
  number,
  port,
  url,
  email,
  boolean,
  json,
  enums,
  regex,
  custom
} from "./validators/index.js"

// Types
export type {
  Validator,
  ValidatorOptions,
  ValidatorMeta,
  EnvSchema,
  InferEnv,
  CreateEnvOptions,
  ValidationError,
  ValidationReport,
  Reporter,
  EnvExplainEntry
} from "./types.js"

export type { StringValidatorOptions } from "./validators/string.js"
export type { NumberValidatorOptions } from "./validators/number.js"
export type { UrlValidatorOptions } from "./validators/url.js"
export type { EnumsValidatorOptions } from "./validators/enums.js"
export type { RegexValidatorOptions } from "./validators/regex.js"
export type { CustomValidatorOptions } from "./validators/custom.js"

export { JelsyError, JelsyAccessError } from "./errors.js"
