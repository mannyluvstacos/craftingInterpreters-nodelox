
import * as readline from 'node:readline/promises'
import * as path from 'node:path'
import { stdin as input, stdout as output } from 'process'

//may need to create a Lox class
//will revisit later
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

/*  private static void runFile(String path) throws IOException {
   byte[] bytes = Files.readAllBytes(Paths.get(path));
   run(new String(bytes, Charset.defaultCharset()));
 } */

function runFile (filePath) {
  const normalizedFilePath = path.normalize(filePath)
  run(normalizedFilePath)

  if (hadError) process.exit(9)
}

main()

/*   private static void runPrompt() throws IOException {
    InputStreamReader input = new InputStreamReader(System.in);
    BufferedReader reader = new BufferedReader(input);

    for (;;) {
      System.out.print("> ");
      String line = reader.readLine();
      if (line == null) break;
      run(line);
    }
  }
 */

function runPrompt () {
  const rl = readline.createInterface({ input, output })
  rl.prompt()
  rl.on('line', (line) => {
    rl.prompt()
    run(line)
    hadError = false
  })
}

/* private static void run(String source) {
  Scanner scanner = new Scanner(source);
  List<Token> tokens = scanner.scanTokens();

  // For now, just print the tokens.
  for (Token token : tokens) {
    System.out.println(token);
  }
} */

function run (source) {
  const scanner = Scanner(source)
  const tokens = scanner.scanTokens()

  for (const token in tokens) {
    console.log({ token })
  }
}

/*
  static void error(int line, String message) {
    report(line, "", message);
  }

  private static void report(int line, String where,
                             String message) {
    System.err.println(
        "[line " + line + "] Error" + where + ": " + message);
    hadError = true;
  }
 */

function error (lineNumber, message) {
  report(lineNumber, '', message)
}

function report (lineNumber, location, message) {
  console.error(`[line ${lineNumber}] Error ${location}: ${message}`)
  hadError = true
}
