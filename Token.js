export class Token {
    constructor(
        type,
        lexeme,
        literal,
        line
    ){
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString(){
        return this.type + " " + lexeme + " " + this.literal;
    }
}