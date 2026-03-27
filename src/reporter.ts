import type { Reporter, ValidationError, ValidationReport } from "./types.js"
import { JelsyError } from "./errors.js"
import { truncateValue } from "./utils.js"

// -- Table formatting helpers ------------------------------------------------

const MAX_COL_WIDTH = 30

const getTerminalWidth = (): number => {
  // process.stdout.columns is undefined in non-TTY environments (CI, piped output)
  if (
    typeof process !== "undefined" &&
    (process.stdout.columns as number | undefined)
  ) {
    return process.stdout.columns
  }
  return 80
}

const padRight = (str: string, len: number): string =>
  str.length >= len ? str : str + " ".repeat(len - str.length)

const clampWidth = (min: number, content: number): number =>
  Math.min(MAX_COL_WIDTH, Math.max(min, content))

const truncateCol = (str: string, max: number): string =>
  str.length <= max ? str : str.slice(0, max - 1) + "\u2026"

const buildErrorMessage = (error: ValidationError): string => {
  if (error.kind === "missing") return "Missing required"
  return error.message
}

const formatReceived = (error: ValidationError): string => {
  if (error.received === undefined) return "-"
  return `"${truncateValue(error.received)}"`
}

// -- Table reporter ----------------------------------------------------------

const formatTable = (report: ValidationReport): string => {
  const entries = Object.values(report.errors)
  const termWidth = getTerminalWidth()

  const separator = "=".repeat(Math.min(termWidth, 72))

  const rows = entries.map((error) => ({
    variable: error.key,
    error: buildErrorMessage(error),
    received: formatReceived(error),
    description: error.desc ?? ""
  }))

  // Compute column widths (capped at MAX_COL_WIDTH)
  const colWidths = {
    variable: clampWidth(8, Math.max(...rows.map((r) => r.variable.length))),
    error: clampWidth(5, Math.max(...rows.map((r) => r.error.length))),
    received: clampWidth(8, Math.max(...rows.map((r) => r.received.length))),
    description: clampWidth(
      11,
      Math.max(...rows.map((r) => r.description.length))
    )
  }

  const headerLine = [
    padRight("Variable", colWidths.variable),
    padRight("Error", colWidths.error),
    padRight("Received", colWidths.received),
    padRight("Description", colWidths.description)
  ].join("   ")

  const dividerLine = [
    "-".repeat(colWidths.variable),
    "-".repeat(colWidths.error),
    "-".repeat(colWidths.received),
    "-".repeat(colWidths.description)
  ].join("   ")

  const dataLines = rows.map((row) =>
    [
      padRight(
        truncateCol(row.variable, colWidths.variable),
        colWidths.variable
      ),
      padRight(truncateCol(row.error, colWidths.error), colWidths.error),
      padRight(
        truncateCol(row.received, colWidths.received),
        colWidths.received
      ),
      padRight(
        truncateCol(row.description, colWidths.description),
        colWidths.description
      )
    ].join("   ")
  )

  const missing = entries.filter((e) => e.kind === "missing").length
  const invalid = entries.filter((e) => e.kind === "invalid").length
  const parts: string[] = []
  if (missing > 0) parts.push(`${String(missing)} missing`)
  if (invalid > 0) parts.push(`${String(invalid)} invalid`)
  const summaryText = parts.join(", ") + ". Exiting."

  const lines = [
    separator,
    "  jelsy: Invalid Environment",
    separator,
    "",
    " " + headerLine,
    " " + dividerLine,
    ...dataLines.map((l) => " " + l),
    "",
    separator,
    `  ${summaryText}`,
    separator
  ]

  return lines.join("\n")
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
