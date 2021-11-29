export class Token {
  constructor (
    type,
    lexeme,
    literal,
    line
  ) {
    this.type = type
    this.lexeme = lexeme
    this.literal = literal
    this.line = line
  }

  toString () {
    console.log('Token toString')
    return this.type + ' ' + this.lexeme + ' ' + this.literal
  }
}
