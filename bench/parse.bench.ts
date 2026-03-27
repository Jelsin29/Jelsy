/**
 * Benchmark: parse 10K env objects with 10 validators each
 * Target: < 5ms
 */
import { Bench } from "tinybench"
import { createEnv, string, number, port, url, email, boolean, json, enums, regex, custom } from "../src/index.js"

const bench = new Bench({ time: 2000 })

// Build a realistic env source with 10 vars
const envSource: Record<string, string> = {
  HOST: "api.example.com",
  PORT: "8080",
  DATABASE_URL: "https://db.example.com/prod",
  ADMIN_EMAIL: "admin@example.com",
  DEBUG: "false",
  MAX_RETRIES: "3",
  CONFIG: '{"feature":true}',
  NODE_ENV: "production",
  LOG_PATTERN: "2024-01-01",
  CUSTOM_ID: "AB-1234"
}

const schema = {
  HOST: string(),
  PORT: port(),
  DATABASE_URL: url(),
  ADMIN_EMAIL: email(),
  DEBUG: boolean(),
  MAX_RETRIES: number({ integer: true }),
  CONFIG: json<{ feature: boolean }>(),
  NODE_ENV: enums({ values: ["development", "staging", "production"] as const }),
  LOG_PATTERN: regex({ pattern: /^\d{4}-\d{2}-\d{2}$/ }),
  CUSTOM_ID: custom({ parser: (v) => v })
}

bench.add("parse single env (10 validators)", () => {
  createEnv(schema, { env: envSource })
})

bench.add("parse 10K env objects (10 validators each)", () => {
  for (let i = 0; i < 10_000; i++) {
    createEnv(schema, { env: envSource })
  }
})

bench.add("parse 1K env objects (10 validators each)", () => {
  for (let i = 0; i < 1_000; i++) {
    createEnv(schema, { env: envSource })
  }
})

await bench.run()

console.log("\n📊 Parse Benchmark Results:")
console.table(bench.table())

// Check against budget
const parse10k = bench.tasks.find((t) => t.name.includes("10K"))
if (parse10k?.result) {
  const avgMs = parse10k.result.mean
  console.log(`\n⏱  10K parse avg: ${avgMs.toFixed(2)}ms (budget: < 5ms)`)
  if (avgMs > 5) {
    console.error("❌ OVER BUDGET: 10K parse exceeds 5ms target")
    process.exit(1)
  } else {
    console.log("✅ Within budget")
  }
}
