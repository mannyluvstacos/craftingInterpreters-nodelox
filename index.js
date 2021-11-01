
import * as readline from 'node:readline/promises'
import * as path from 'node:path'
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

/*  private static void runFile(String path) throws IOException {
   byte[] bytes = Files.readAllBytes(Paths.get(path));
   run(new String(bytes, Charset.defaultCharset()));
 } */

function runFile(filePath){
  const normalizedFilePath = path.normalize(filePath);
  runFile(normalizedFilePath);
}

main();


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

function runPrompt() {
  const rl = readline.createInterface({input,output})
}