import * as Expr from "./Expr.js";
import { TokenType } from "./TokenType.js";
import * as err from "./error.js"

export class Parser {
    tokens = [];
    current = 0;
    
    constructor(tokens){
        if(process.env.DEBUG) console.log({tokens})
        this.tokens = tokens
    }

    parse(){
        try {
            return this.expression();
        } catch(error){
            return null;
        }
    }

    expression(){
        if(process.env.DEBUG) console.log('expression')
        return this.equality();
    }

    equality(){
        if(process.env.DEBUG) console.log('equality')        
        let expr = this.comparison();

        if(process.env.DEBUG) console.log('equality',{expr})
        while(this.match([TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL])) {
            let operator = this.previous();
            let right = this.comparison();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    comparison(){
        if(process.env.DEBUG) console.log('comparison')
        let expr = this.term();

        if(process.env.DEBUG) console.log('comparison',{expr})
        while(this.match([TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL])) {
            let operator = this.previous();
            let right = this.term();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    term(){
        if(process.env.DEBUG) console.log('term')
        let expr = this.factor();
        while(this.match([TokenType.MINUS, TokenType.PLUS])) {
            let operator = this.previous();
            let right = this.factor();
            expr = new Expr.Binary(expr, operator, right);
        }
        return expr;
    }

    factor() {
        if(process.env.DEBUG) console.log('factor')
        let expr = this.unary();
        while(this.match([TokenType.SLASH, TokenType.STAR])){
            let operator = this.previous();
            let right = this.unary();
            expr = new Expr.Binary(expr, operator, right);
        }
        return expr;
    }

    unary(){
        if(process.env.DEBUG) console.log('unary')
        if(this.match([TokenType.BANG, TokenType.MINUS])) {
            let operator = this.previous();
            let right = this.unary();
            if(process.env.DEBUG) console.log({operator, right})
            return new Expr.Unary(operator, right);
        }
        if(process.env.DEBUG) console.log('unary - outside loop')
        return this.primary();
    }

    primary(){
        if(process.env.DEBUG) console.log('primary')
        if(this.match([TokenType.FALSE])) return new Expr.Literal(false);
        if(this.match([TokenType.TRUE])) return new Expr.Literal(true);
        if(this.match([TokenType.NIL])) return new Expr.Literal(null);

        if(this.match([TokenType.NUMBER, TokenType.STRING])) {
            return new Expr.Literal(this.previous().literal);
        }

        if(this.match([TokenType.LEFT_PAREN])) {
            let expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
            return new Expr.Grouping(expr);
        }

        throw err.tokenError(this.peek(), "Expect expression.")
    }

    match(types){
        if(process.env.DEBUG) console.log('match')
        if(process.env.DEBUG) console.log({types})
        if(process.env.DEBUG) console.log('what now?')
        for(let type of types){
            if(process.env.DEBUG) console.log('inside match loop')
            if(this.check(type)){
                this.advance();
                return true;
            }
        }
        if(process.env.DEBUG) console.log('outside match loop')
        return false;
    }

    consume(type, message){
        if(this.check(type)) return this.advance();

        throw this.error(this.peek(), message);
    }
    
    check(type){
        if(process.env.DEBUG) console.log('check')
        if(this.isAtEnd()) return false;

        if(process.env.DEBUG) console.log('check - outside if')
        return this.peek().type === type;
    }

    advance(){
        if(!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd(){
        if(process.env.DEBUG) console.log('isAtEnd')
        if(process.env.DEBUG) console.log('isAtEnd', 'this.peek().type', this.peek().type)
        return this.peek().type === TokenType.EOF
    }

    peek() {
        if(process.env.DEBUG) console.log('peek - ', 'this.tokens[this.current]', this.tokens[this.current])
        return this.tokens[this.current];
    }

    previous() {
        if(process.env.DEBUG) console.log('previous')
        return this.tokens[this.current - 1];
    }

    error(token, message) {
        err.tokenError(token, message);
        return new ParseError()
    }

    syncrhonize(){
        this.advance();

        while(!this.isAtEnd()){
            if(this.previous().type === TokenType.SEMICOLON) return;

            switch(this.peek().type){
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }
        }
        this.advance();
    }
}

class ParseError extends Error {

}