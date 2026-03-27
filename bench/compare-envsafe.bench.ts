/**
 * Benchmark: head-to-head vs envsafe (KATT) with identical schemas
 *
 * Requires: npm install --save-dev envsafe
 * If envsafe is not installed, this benchmark is skipped.
 */
import { Bench } from "tinybench"
import { createEnv, string, number, port, boolean, url } from "../src/index.js"

const bench = new Bench({ time: 2000 })

// Jelsy schema
const jelsyEnv: Record<string, string> = {
  HOST: "api.example.com",
  PORT: "8080",
  DATABASE_URL: "https://db.example.com/prod",
  DEBUG: "false",
  MAX_RETRIES: "3"
}

const jelsySchema = {
  HOST: string(),
  PORT: port(),
  DATABASE_URL: url(),
  DEBUG: boolean(),
  MAX_RETRIES: number({ integer: true })
}

bench.add("Jelsy — parse 1K envs (5 validators)", () => {
  for (let i = 0; i < 1000; i++) {
    createEnv(jelsySchema, { env: jelsyEnv })
  }
})

// Try to load envsafe for comparison
try {
  const { envsafe, port: envsafePort, str, bool, url: envsafeUrl, num } = await import("envsafe")

  bench.add("envsafe — parse 1K envs (5 validators)", () => {
    for (let i = 0; i < 1000; i++) {
      envsafe(
        {
          HOST: str(),
          PORT: envsafePort(),
          DATABASE_URL: envsafeUrl(),
          DEBUG: bool(),
          MAX_RETRIES: num()
        },
        { env: jelsyEnv }
      )
    }
  })
} catch {
  console.log("⚠️  envsafe not installed — skipping comparison. Install with: npm install --save-dev envsafe")
}

await bench.run()

console.log("\n📊 Jelsy vs envsafe Benchmark Results:")
console.table(bench.table())
