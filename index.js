
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'process'

let hadError = false

function main () {
  const args = process.argv.slice(2)
  if (args.length > 1) {
    console.log('Usage: nodelox [script]')
    process.exit(9)
  } else if (args.length === 1) {
    runFile(args[0])
  } else {
    runPrompt()
  }
}

// string
function runFile (fileName) {
  // Indicated an error in the exit code.
  if (hadError) process.exit(9)

  // throwsIOException
  run(fileName)
}

function runPrompt () {
// throwsIOException
  const rl = readline.createInterface({ input, output })
  rl.prompt()

  rl.on('line', (line) => {
    rl.setPrompt('> ')
    rl.prompt()
    run(line)
    hadError = false;
  })
}

// string
function run (line) {
// take the lines and break them up into tokens

  const tokens = line.split(/\s/)
  console.log({ tokens })
}

function error (lineNumber, message) {
  report(lineNumber, '', message)
}

function report (lineNumber, where, message) {
  console.error(`[line ${lineNumber}] Error ${where}: ${message}`)
  hadError = true
}

main()
