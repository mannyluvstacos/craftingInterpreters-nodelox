
/*
  static void error(int line, String message) {
    report(line, "", message);
  }

  private static void report(int line, String where,
                             String message) {
    System.err.println(
        "[line " + line + "] Error" + where + ": " + message);
    this.hadError = true;
  }
 */

export function error (lineNumber, message) {
  report(lineNumber, '', message)
}

function report (lineNumber, location, message) {
  console.error(`[line ${lineNumber}] Error ${location}: ${message}`)
  this.hadError = true
}
