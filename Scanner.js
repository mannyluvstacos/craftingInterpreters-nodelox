import { Token } from './Token';
import {TokenType} from './TokenType'

export class Scanner {
    start = 0
    current = 0
    line = 1
    source=''
    tokens=[]
    token = ''

    constructor(source){
        this.source = source;
        return this.source;
    }
    scanTokens(){
        while(!isAtEnd()){
            let start = current;
            this.scanToken();
        }
        this.tokens.push(new Token(EOF, "", null, line));
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

            // TODO: determine how to pass in the error
            // func from Lox class
            default: console.error("Unexpected character.")
        }
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