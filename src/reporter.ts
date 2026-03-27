import type { Reporter, ValidationReport } from "./types.js"
import { JelsyError } from "./errors.js"
import { truncateValue } from "./utils.js"

// -- Table formatting helpers ------------------------------------------------

const W = 30
const pad = (s: string, n: number): string =>
  s.length >= n ? s : s + " ".repeat(n - s.length)
const clamp = (min: number, v: number): number => Math.min(W, Math.max(min, v))
const trunc = (s: string, n: number): string =>
  s.length <= n ? s : s.slice(0, n - 1) + "\u2026"
const cell = (s: string, w: number): string => pad(trunc(s, w), w)

// -- Table reporter ----------------------------------------------------------

const formatTable = (report: ValidationReport): string => {
  const entries = Object.values(report.errors)
  const tw =
    typeof process !== "undefined" &&
    (process.stdout.columns as number | undefined)
      ? process.stdout.columns
      : 80
  const sep = "=".repeat(Math.min(tw, 72))

  const rows = entries.map((e) => [
    e.key,
    e.kind === "missing" ? "Missing required" : e.message,
    e.received === undefined ? "-" : `"${truncateValue(e.received)}"`,
    e.desc ?? ""
  ])

  const mins = [8, 5, 8, 11]
  const headers = ["Variable", "Error", "Received", "Description"]
  const ws = headers.map((h, i) =>
    clamp(
      mins[i] ?? 0,
      Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length))
    )
  )

  const J = (cs: string[]): string => cs.join("   ")
  const hdr = J(ws.map((w, i) => pad(headers[i] ?? "", w)))
  const div = J(ws.map((w) => "-".repeat(w)))
  const data = rows.map((r) => J(ws.map((w, i) => cell(r[i] ?? "", w))))

  let missing = 0
  let invalid = 0
  entries.forEach((e) => {
    if (e.kind === "missing") missing++
    else invalid++
  })
  const parts: string[] = []
  if (missing > 0) parts.push(`${String(missing)} missing`)
  if (invalid > 0) parts.push(`${String(invalid)} invalid`)

  return [
    sep,
    "  jelsy: Invalid Environment",
    sep,
    "",
    " " + hdr,
    " " + div,
    ...data.map((l) => " " + l),
    "",
    sep,
    `  ${parts.join(", ")}. Exiting.`,
    sep
  ].join("\n")
}

// -- Exported reporters ------------------------------------------------------

/**
 * Default reporter — formats errors as a table on stderr.
 * In Node: writes to stderr and calls process.exit(1).
 * In browser/non-Node: throws JelsyError.
 */
export const defaultReporter: Reporter = (report: ValidationReport): void => {
  const table = formatTable(report)

  if (typeof process !== "undefined") {
    process.stderr.write(table + "\n")
    process.exit(1)
  }

  throw new JelsyError(report.errors)
}

/**
 * Formats the validation report as a table string without side effects.
 * Useful for custom reporters that need the table format.
 */
export const formatReportTable = (report: ValidationReport): string =>
  formatTable(report)
