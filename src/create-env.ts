// TODO: Implement createEnv
import type { CreateEnvOptions, EnvSchema, InferEnv } from "./types.js"

export const createEnv = <TSchema extends EnvSchema>(
  _schema: TSchema,
  _options?: CreateEnvOptions
): Readonly<InferEnv<TSchema>> => {
  // Stub — will be implemented in Sprint 3
  throw new Error("createEnv not yet implemented")
}
