
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

import { TokenType } from './TokenType.js'

export function error (lineNumber, message) {
  report(lineNumber, '', message)
}

function report (lineNumber, location, message) {
  console.error(`[line ${lineNumber}] Error ${location}: ${message}`)
  this.hadError = true
}

export function tokenError (token, message) {
  if (token.type === TokenType.EOF) {
    report(token.line, ' at end', message)
  } else {
    report(token.line, " at '", token.lexeme + "'" + message)
  }
}
