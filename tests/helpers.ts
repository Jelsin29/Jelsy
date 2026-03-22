import type { EnvExplainEntry } from "../src/types.js"

export const getExplain = (env: unknown): EnvExplainEntry[] =>
  (env as { explain: () => EnvExplainEntry[] }).explain()
