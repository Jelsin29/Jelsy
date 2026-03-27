import type { Reporter, ValidationError, ValidationReport } from "./types.js"
import { JelsyError } from "./errors.js"
import { truncateValue } from "./utils.js"

// -- Table formatting helpers ------------------------------------------------

const getTerminalWidth = (): number => {
  if (typeof process !== "undefined" && process.stdout.columns > 0) {
    return process.stdout.columns
  }
  return 80
}

const padRight = (str: string, len: number): string =>
  str.length >= len ? str : str + " ".repeat(len - str.length)

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

  // Compute column widths
  const colWidths = {
    variable: Math.max(8, ...rows.map((r) => r.variable.length)),
    error: Math.max(5, ...rows.map((r) => r.error.length)),
    received: Math.max(8, ...rows.map((r) => r.received.length)),
    description: Math.max(11, ...rows.map((r) => r.description.length))
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
      padRight(row.variable, colWidths.variable),
      padRight(row.error, colWidths.error),
      padRight(row.received, colWidths.received),
      padRight(row.description, colWidths.description)
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
