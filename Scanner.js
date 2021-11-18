import { Token } from './Token.js';
import {TokenType} from './TokenType.js'

export class Scanner {
    start = 0
    current = 0
    line = 1
    source=''
    tokens=[]
    token = ''

    keywords = new Map([
        ["and",    TokenType.AND],
        ["class",  TokenType.CLASS],
        ["else",   TokenType.ELSE],
        ["false",  TokenType.FALSE],
        ["for",    TokenType.FOR],
        ["fun",    TokenType.FUN],
        ["if",     TokenType.IF],
        ["nil",    TokenType.NIL],
        ["or",     TokenType.OR],
        ["print",  TokenType.PRINT],
        ["return", TokenType.RETURN],
        ["super",  TokenType.SUPER],
        ["this",   TokenType.THIS],
        ["true",   TokenType.TRUE],
        ["var",    TokenType.VAR],
        ["while",  TokenType.WHILE],
        ])



    constructor(source){
        this.source = source;
        return this.source;
    }
    scanTokens(){
        while(!this.isAtEnd()){
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    scanToken(){
        let character = this.advance();
        switch (character) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '!':this.addToken(this.match('=') ? TokenType.BANG_EQUAL:TokenType.BANG ); break;
            case '=':this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL: TokenType.EQUAL ); break;
            case '<':this.addToken(this.match('=') ? TokenType.LESS_EQUAL: TokenType.LESS ); break;
            case '?':this.addToken(this.match('=') ? TokenType.GREATER_EQUAL:TokenType.GREATER); break;
            case '/':
                if(this.match('/')) {
                    while(this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;


                case ' ':
                    case '\r':
                    case '\t':
                      // Ignore whitespace.
                      break;
              
                    case '\n':
                      this.line++;
                      break;

                      case '"': this.string(); break;
                      
            // TODO: determine how to pass in the error
            // func from Lox class
            default: if(this.isDigit(character)) {
                this.number();
            } else if (this.isAlpha(character)){
                this.identifier();
            }
            else {
                console.error(this.line, "Unexpected character.");
            }
            break;
        }
    }

    identifier(){
        while(this.isAlphaNumeric (this.peek())) {
            this.advance();
        }
        let text = this.source.substring(this.start, this.current);
        let type = this.keywords.get(text);
        if(type === null) type = TokenType.IDENTIFIER;
        this.addToken(type);
    }

    number() {
        while(this.isDigit(this.peek())){
            this.advance();
        }

        if(this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance();

            while(this.isDigit(this.peek())){
                this.advance();
            }
        }
        this.addToken(TokenType.NUMBER,parseFloat(this.source.substring(this.start, this.current)));
    }

     string(){
        while(this.peek() != '"' && !this.isAtEnd()) {
            if(this.peek() === '\n') this.line++;
            this.advance();
        }

        if(this.isAtEnd()) {
            console.error(this.line, "Unterminated string.");
            return;
        }
        
        this.advance();

        let value = this.source.substring(this.start+1, this.current-1);
        this.addToken(TokenType.STRING, value);
    }

    match(expected) {
        if(this.isAtEnd()) return false;
        if(this.source.charAt(this.current) != expected) return false;

        this.current++;
        return true;
    }

    peek() {
        if(this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    peekNext(){
        if(this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }

    isAlpha(character) {
        return (character >= 'a' && character <= 'z') ||
            (character >= 'A' && character <= 'Z') ||
            character === '_';
    }

    isAlphaNumeric(character) {
        return this.isAlpha(character) || this.isDigit(character);
    }

    isDigit(character) {
        return character >= '0' && character <= '9';
    }

    isAtEnd(){
        return this.current >= this.source.length
    }

    advance(){
        return this.source.charAt(this.current++)
    }

    /* 
    This function was originally overloaded
    I am choosing to use a default assingment
    for the 'literal' parameter
     */
    addToken(type, literal = null){
        let text = this.source.substring(this.start, this.current);
        // push instead of add, original code made use of arrayList
        this.tokens.push(new Token(type, text, literal, this.line));
    }

}