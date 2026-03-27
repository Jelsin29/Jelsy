/**
 * Benchmark: build, gzip, measure, compare against 3KB threshold
 * Target: < 3KB min+gzip (full), < 1KB (minimal)
 *
 * This is NOT a tinybench benchmark — it measures build output size.
 * Run: node --import tsx bench/bundle-size.bench.ts
 */
import { execSync } from "node:child_process"
import { readFileSync, statSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { resolve } from "node:path"

const run = (cmd: string): string => execSync(cmd, { encoding: "utf8" }).trim()

console.log("\n📦 Bundle Size Benchmark\n")

// Build first
console.log("Building...")
run("npx tsup")

const distDir = resolve("dist")

// Measure ESM bundle
const esmPath = resolve(distDir, "index.mjs")
const esmStat = statSync(esmPath)
const esmContent = readFileSync(esmPath)
const esmGzipped = gzipSync(esmContent, { level: 9 })

// Measure CJS bundle
const cjsPath = resolve(distDir, "index.cjs")
const cjsStat = statSync(cjsPath)
const cjsContent = readFileSync(cjsPath)
const cjsGzipped = gzipSync(cjsContent, { level: 9 })

const toKB = (bytes: number): string => (bytes / 1024).toFixed(2)

console.log("┌────────────────────────────────────────┐")
console.log("│  Format   │  Raw      │  min+gzip      │")
console.log("├────────────────────────────────────────┤")
console.log(
  `│  ESM      │  ${toKB(esmStat.size).padStart(6)}KB │  ${toKB(esmGzipped.length).padStart(6)}KB       │`
)
console.log(
  `│  CJS      │  ${toKB(cjsStat.size).padStart(6)}KB │  ${toKB(cjsGzipped.length).padStart(6)}KB       │`
)
console.log("└────────────────────────────────────────┘")

const BUDGET_KB = 3
const esmGzipKB = esmGzipped.length / 1024

console.log(
  `\n⏱  ESM min+gzip: ${toKB(esmGzipped.length)}KB (budget: < ${String(BUDGET_KB)}KB)`
)
if (esmGzipKB > BUDGET_KB) {
  console.error(
    `❌ OVER BUDGET: ESM bundle is ${toKB(esmGzipped.length)}KB gzipped (limit: ${String(BUDGET_KB)}KB)`
  )
  process.exit(1)
} else {
  console.log("✅ Within budget")
}
