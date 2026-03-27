/**
 * Benchmark: Jelsy vs Zod for env-shaped flat record validation
 *
 * Requires: npm install --save-dev zod
 * If zod is not installed, this benchmark is skipped.
 */
import { Bench } from "tinybench"
import {
  createEnv,
  string,
  number,
  port,
  boolean,
  enums
} from "../src/index.js"

const bench = new Bench({ time: 2000 })

const envSource: Record<string, string> = {
  HOST: "api.example.com",
  PORT: "8080",
  DEBUG: "false",
  MAX_RETRIES: "3",
  NODE_ENV: "production"
}

// Jelsy
const jelsySchema = {
  HOST: string(),
  PORT: port(),
  DEBUG: boolean(),
  MAX_RETRIES: number({ integer: true }),
  NODE_ENV: enums({ values: ["development", "staging", "production"] as const })
}

bench.add("Jelsy — parse 1K envs (5 validators)", () => {
  for (let i = 0; i < 1000; i++) {
    createEnv(jelsySchema, { env: envSource })
  }
})

// Try to load Zod for comparison
try {
  const { z } = await import("zod")

  const zodSchema = z.object({
    HOST: z.string().min(1),
    PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)),
    DEBUG: z
      .enum(["true", "false", "1", "0"])
      .transform((v) => v === "true" || v === "1"),
    MAX_RETRIES: z.string().transform(Number).pipe(z.number().int()),
    NODE_ENV: z.enum(["development", "staging", "production"])
  })

  bench.add("Zod — parse 1K envs (5 validators)", () => {
    for (let i = 0; i < 1000; i++) {
      zodSchema.parse(envSource)
    }
  })
} catch {
  console.log(
    "⚠️  zod not installed — skipping comparison. Install with: npm install --save-dev zod"
  )
}

await bench.run()

console.log("\n📊 Jelsy vs Zod Benchmark Results:")
console.table(bench.table())
