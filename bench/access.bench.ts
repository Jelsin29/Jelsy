/**
 * Benchmark: 1M property reads on frozen object vs Proxy baseline
 * Target: < 2ms for 1M reads on frozen object
 */
import { Bench } from "tinybench"
import { createEnv, string, number, port, boolean } from "../src/index.js"

const bench = new Bench({ time: 2000 })

// Create a frozen env object (Jelsy's approach)
const frozenEnv = createEnv(
  {
    HOST: string({ default: "localhost" }),
    PORT: port({ default: 3000 }),
    DEBUG: boolean({ default: false }),
    MAX_RETRIES: number({ default: 3 })
  },
  { env: {} }
)

// Create a Proxy-wrapped object (competitor approach) for comparison
const proxyEnv = new Proxy(
  { HOST: "localhost", PORT: 3000, DEBUG: false, MAX_RETRIES: 3 },
  {
    get(target, prop) {
      if (typeof prop === "string" && prop in target) {
        return target[prop as keyof typeof target]
      }
      throw new Error(`Unknown env var: ${String(prop)}`)
    }
  }
)

// Create a plain object baseline
const plainEnv = { HOST: "localhost", PORT: 3000, DEBUG: false, MAX_RETRIES: 3 }

bench.add("1M reads — Object.freeze (Jelsy)", () => {
  let sum = 0
  for (let i = 0; i < 1_000_000; i++) {
    sum += frozenEnv.PORT
  }
  return sum
})

bench.add("1M reads — Proxy (competitor pattern)", () => {
  let sum = 0
  for (let i = 0; i < 1_000_000; i++) {
    sum += (proxyEnv as { PORT: number }).PORT
  }
  return sum
})

bench.add("1M reads — plain object (baseline)", () => {
  let sum = 0
  for (let i = 0; i < 1_000_000; i++) {
    sum += plainEnv.PORT
  }
  return sum
})

await bench.run()

console.log("\n📊 Property Access Benchmark Results:")
console.table(bench.table())

// Check frozen reads against budget
const frozenTask = bench.tasks.find((t) => t.name.includes("freeze") || t.name.includes("Jelsy"))
if (frozenTask?.result) {
  const avgMs = frozenTask.result.mean
  console.log(`\n⏱  1M frozen reads avg: ${avgMs.toFixed(2)}ms (budget: < 2ms)`)
  if (avgMs > 2) {
    console.error("❌ OVER BUDGET: 1M reads exceeds 2ms target")
    process.exit(1)
  } else {
    console.log("✅ Within budget")
  }
}
