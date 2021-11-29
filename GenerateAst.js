import fs from 'node:fs'

export class GenerateAst {
  main () {
    const args = process.argv.slice(2)
    if (args.length !== 1) {
      console.error('Usage: generate_ast <output directory>')
      process.exit(64)
    }
    const outputDir = args[0]
    this.defineAst(outputDir, 'Expr', [
      'Assign : Token name, Expr value',
      'Binary   : Expr left, Token operator, Expr right',
      'Call     : Expr callee, Token paren, List<Expr> argments',
      'Grouping : Expr expression',
      'Literal  : Object value',
      'Logical  : Expr left, Token operator, Expr right',
      'Unary    : Token operator, Expr right',
      'Variable : Token name'
    ])

    this.defineAst(outputDir, 'Stmt', [
      'Block : List<Stmt> statements',
      'Expression : Expr expression',
      'Func   : Token name, List<Token> params,' +
                  ' List<Stmt> body',
      'If         : Expr condition, Stmt thenBranch,' +
                  ' Stmt elseBranch',
      'Print      : Expr expression',
      'Var        : Token name, Expr initializer',
      'While      : Expr condition, Stmt body'
    ])
  }

  defineAst (outputDir, baseName, types) {
    const path = outputDir + '/' + baseName + '.js'
    const writer = fs.createWriteStream(path)

    writer.write('export class ' + baseName + ' {\n')
    writer.write('}\n')

    for (const type of types) {
      const [className, fieldList] = type.split(':')
      this.defineType(writer, baseName, className.trim(), fieldList.trim())
      writer.write('\n')
    }

    writer.write('\n')
    writer.end()
  }

  defineType (writer, baseName, className, fieldList) {
    writer.write('export class ' + className + ' extends ' + baseName + ' {')

    const adjustedFieldList = fieldList.split(', ').map((element) => {
      return element.split(' ')[1]
    })
    // Constructor
    writer.write('  constructor( ' + adjustedFieldList.toString() + ' ) {\n')
    writer.write('super();\n')
    const fields = adjustedFieldList.toString().split(',')
    for (const field of fields) {
      const name = field
      writer.write('    this.' + name + ' = ' + name + ';\n')
    }

    writer.write('  }\n')

    // Visitor ?
    writer.write('  accept(visitor) {\n')
    writer.write('  return visitor.visit' + className + baseName + '(this);\n')
    writer.write('    }')

    // Fields.
    for (const field of fields) {
      writer.write('  ' + field + ';\n')
    }

    writer.write('}')
  }
}

(() => {
  const generateAst = new GenerateAst()
  generateAst.main()
})()
