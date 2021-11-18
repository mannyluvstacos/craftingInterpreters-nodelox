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
      'Binary   : Expr left, Token operator, Expr right',
      'Grouping : Expr expression',
      'Literal  : Object value',
      'Unary    : Token operator, Expr right'
    ])
  }

  defineAst (outputDir, baseName, types) {
    const path = outputDir + '/' + baseName + '.js'
    const writer = fs.createWriteStream(path)

    writer.write('export class ' + baseName + ' {\n')
    writer.write('}\n')

    for (const type of types) {
      console.log({ type })
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
