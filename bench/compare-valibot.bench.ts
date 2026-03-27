/**
 * Benchmark: Jelsy vs Valibot for env-shaped flat record validation
 *
 * Requires: npm install --save-dev valibot
 * If valibot is not installed, this benchmark is skipped.
 */
import { Bench } from "tinybench"
import { createEnv, string, number, port, boolean, enums } from "../src/index.js"

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

// Try to load Valibot for comparison
try {
  const v = await import("valibot")

  const valibotSchema = v.object({
    HOST: v.pipe(v.string(), v.minLength(1)),
    PORT: v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1), v.maxValue(65535)),
    DEBUG: v.pipe(v.picklist(["true", "false", "1", "0"]), v.transform((val: string) => val === "true" || val === "1")),
    MAX_RETRIES: v.pipe(v.string(), v.transform(Number), v.number(), v.integer()),
    NODE_ENV: v.picklist(["development", "staging", "production"])
  })

  bench.add("Valibot — parse 1K envs (5 validators)", () => {
    for (let i = 0; i < 1000; i++) {
      v.parse(valibotSchema, envSource)
    }
  })
} catch {
  console.log("⚠️  valibot not installed — skipping comparison. Install with: npm install --save-dev valibot")
}

await bench.run()

console.log("\n📊 Jelsy vs Valibot Benchmark Results:")
console.table(bench.table())
