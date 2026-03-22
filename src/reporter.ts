import type { Reporter } from "./types.js"
import { JelsyError } from "./errors.js"

/**
 * Minimal reporter — simply re-throws as JelsyError.
 * Full table reporter (coloured, formatted) will replace this later.
 *
 * createEnv has its own inline fallback that throws JelsyError when no
 * reporter is provided. This export exists for users who import
 * defaultReporter directly and pass it as the `reporter` option.
 */
export const defaultReporter: Reporter = (report): void => {
  throw new JelsyError(report.errors)
}
