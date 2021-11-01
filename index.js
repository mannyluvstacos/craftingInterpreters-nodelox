


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

main();