import { describe, it, expect, vi, afterEach } from "vitest"
import { formatReportTable, defaultReporter } from "../src/index.js"
import type { ValidationReport } from "../src/types.js"

// ---------------------------------------------------------------------------
// Helper: build a ValidationReport for testing
// ---------------------------------------------------------------------------
const makeReport = (
  errors: Record<
    string,
    {
      kind: "missing" | "invalid"
      message: string
      received?: string
      desc?: string
      example?: string
    }
  >
): ValidationReport => ({
  errors: Object.fromEntries(
    Object.entries(errors).map(([key, e]) => [
      key,
      { key, kind: e.kind, message: e.message, received: e.received, desc: e.desc, example: e.example }
    ])
  ),
  env: {}
})

// ---------------------------------------------------------------------------
// formatReportTable
// ---------------------------------------------------------------------------
describe("formatReportTable", () => {
  it("produces header with jelsy branding", () => {
    const report = makeReport({
      PORT: { kind: "missing", message: "Missing required" }
    })
    const table = formatReportTable(report)
    expect(table).toContain("jelsy: Invalid Environment")
  })

  it("includes column headers: Variable, Error, Received, Description", () => {
    const report = makeReport({
      PORT: { kind: "missing", message: "Missing required" }
    })
    const table = formatReportTable(report)
    expect(table).toContain("Variable")
    expect(table).toContain("Error")
    expect(table).toContain("Received")
    expect(table).toContain("Description")
  })

  it("shows variable name in table", () => {
    const report = makeReport({
      DATABASE_URL: { kind: "missing", message: "Missing required" }
    })
    const table = formatReportTable(report)
    expect(table).toContain("DATABASE_URL")
  })

  it("shows 'Missing required' for missing kind", () => {
    const report = makeReport({
      API_KEY: { kind: "missing", message: "some message" }
    })
    const table = formatReportTable(report)
    expect(table).toContain("Missing required")
  })

  it("shows actual error message for invalid kind", () => {
    const report = makeReport({
      PORT: { kind: "invalid", message: "Not a valid port" }
    })
    const table = formatReportTable(report)
    expect(table).toContain("Not a valid port")
  })

  it("shows dash for missing received value", () => {
    const report = makeReport({
      HOST: { kind: "missing", message: "Missing required" }
    })
    const table = formatReportTable(report)
    // The row for HOST should contain a dash in the received column
    const lines = table.split("\n")
    const hostLine = lines.find((l) => l.includes("HOST"))
    expect(hostLine).toBeDefined()
    expect(hostLine).toContain("-")
  })

  it("truncates long received values", () => {
    const report = makeReport({
      SECRET: {
        kind: "invalid",
        message: "Bad format",
        received: "super-long-secret-value-here"
      }
    })
    const table = formatReportTable(report)
    // truncateValue keeps first 4 chars + "***" for values > 8 chars
    expect(table).toContain("supe***")
    expect(table).not.toContain("super-long-secret-value-here")
  })

  it("shows description when provided", () => {
    const report = makeReport({
      DB_URL: {
        kind: "missing",
        message: "Missing required",
        desc: "Database connection string"
      }
    })
    const table = formatReportTable(report)
    expect(table).toContain("Database connection string")
  })

  it("shows empty description when not provided", () => {
    const report = makeReport({
      HOST: { kind: "missing", message: "Missing required" }
    })
    const table = formatReportTable(report)
    // Should not crash, should produce valid table
    expect(table).toContain("HOST")
  })

  it("shows correct summary for missing only", () => {
    const report = makeReport({
      A: { kind: "missing", message: "Missing required" },
      B: { kind: "missing", message: "Missing required" }
    })
    const table = formatReportTable(report)
    expect(table).toContain("2 missing. Exiting.")
  })

  it("shows correct summary for invalid only", () => {
    const report = makeReport({
      PORT: { kind: "invalid", message: "Not a port", received: "abc" }
    })
    const table = formatReportTable(report)
    expect(table).toContain("1 invalid. Exiting.")
  })

  it("shows correct summary for mixed missing and invalid", () => {
    const report = makeReport({
      A: { kind: "missing", message: "Missing required" },
      B: { kind: "invalid", message: "Bad value", received: "xyz" },
      C: { kind: "missing", message: "Missing required" }
    })
    const table = formatReportTable(report)
    expect(table).toContain("2 missing, 1 invalid. Exiting.")
  })

  it("handles multiple errors with aligned columns", () => {
    const report = makeReport({
      DATABASE_URL: {
        kind: "missing",
        message: "Missing required",
        desc: "Database connection string"
      },
      PORT: {
        kind: "invalid",
        message: "Not a valid port",
        received: "abc",
        desc: "Server port (1-65535)"
      }
    })
    const table = formatReportTable(report)
    // Both entries should be present
    expect(table).toContain("DATABASE_URL")
    expect(table).toContain("PORT")
    expect(table).toContain("Database connection string")
    expect(table).toContain("Server port (1-65535)")
  })

  it("uses separator lines with equals signs", () => {
    const report = makeReport({
      X: { kind: "missing", message: "Missing required" }
    })
    const table = formatReportTable(report)
    // Should contain at least 4 separator lines (top, after branding, before summary, after summary)
    const separatorLines = table.split("\n").filter((l) => /^=+$/.test(l))
    expect(separatorLines.length).toBeGreaterThanOrEqual(4)
  })

  it("uses divider line with dashes between header and data", () => {
    const report = makeReport({
      X: { kind: "missing", message: "Missing required" }
    })
    const table = formatReportTable(report)
    const lines = table.split("\n")
    // Find the divider line (contains only dashes and spaces)
    const divider = lines.find((l) => l.trim().length > 0 && /^[\s-]+$/.test(l))
    expect(divider).toBeDefined()
  })

  it("short received values are not truncated", () => {
    const report = makeReport({
      PORT: { kind: "invalid", message: "Bad", received: "abc" }
    })
    const table = formatReportTable(report)
    expect(table).toContain('"abc"')
  })
})

// ---------------------------------------------------------------------------
// defaultReporter
// ---------------------------------------------------------------------------
describe("defaultReporter", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("writes table to stderr and calls process.exit(1) in Node", () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true)
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called")
    })

    const report = makeReport({
      HOST: { kind: "missing", message: "Missing required" }
    })

    expect(() => defaultReporter(report)).toThrow("process.exit called")
    expect(stderrSpy).toHaveBeenCalledOnce()
    const output = stderrSpy.mock.calls[0]![0] as string
    expect(output).toContain("jelsy: Invalid Environment")
    expect(output).toContain("HOST")
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it("table output sent to stderr matches formatReportTable output", () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true)
    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called")
    })

    const report = makeReport({
      PORT: { kind: "invalid", message: "Bad port", received: "xyz" }
    })

    try {
      defaultReporter(report)
    } catch {
      // expected
    }

    const stderrOutput = stderrSpy.mock.calls[0]![0] as string
    const expectedTable = formatReportTable(report)
    expect(stderrOutput).toBe(expectedTable + "\n")
  })
})
