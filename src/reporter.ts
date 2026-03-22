import type { Reporter } from "./types.js"
import { JelsyError } from "./errors.js"

export const defaultReporter: Reporter = (report): void => {
  throw new JelsyError(report.errors)
}
