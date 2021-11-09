
import * as readline from 'node:readline/promises'
import * as path from 'node:path'
import { stdin as input, stdout as output } from 'process'
import {Scanner} from './Scanner.js'
import {error as importedError} from './error.js'


export class Lox {
  hadError = false

  main () {
    const args = process.argv.slice(2)
    if (args.length > 1) {
      console.log('Usage: nodelox [script]')
      process.exit(9)
    } else if (args.length === 1) {
      runFile(args[0])
    } else {
      this.runPrompt()
    }
  }

/*  private static void runFile(String path) throws IOException {
   byte[] bytes = Files.readAllBytes(Paths.get(path));
   run(new String(bytes, Charset.defaultCharset()));
 } */

 runFile (filePath) {
  const normalizedFilePath = path.normalize(filePath)
  run(normalizedFilePath)

  if (this.hadError) process.exit(9)
}

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

runPrompt () {
  const rl = readline.createInterface({ input, output })
  rl.prompt()
  rl.on('line', (line) => {
    this.run(line)
    this.hadError = false
    rl.setPrompt('>')
    rl.prompt()
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

run (source) {
  const scanner = new Scanner(source)
  const tokens = scanner.scanTokens()

  for (const token in tokens) {
    console.log({ token: tokens[token] })
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
    this.hadError = true;
  }
 */
error = importedError;

}



(()=>{
  let lox = new Lox();
  lox.main()
})();