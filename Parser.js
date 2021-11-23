import * as Expr from "./Expr.js";
import * as Stmt from "./Stmt.js";
import { TokenType } from "./TokenType.js";
import * as err from "./error.js"

export class Parser {
    tokens = [];
    current = 0;
    
    constructor(tokens){
        this.tokens = tokens
    }

    parse(){
        let statements = [];
        while(!this.isAtEnd()){
            statements.push(this.statement());
        }


        return statements;
    }

    expression(){
        return this.equality();
    }

    statement(){
        if(this.match([TokenType.PRINT])) return this.printStatement();

        return this.expressionStatement();
    }

    printStatement(){
        let value = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Stmt.Print(value);
    }

    expressionStatement(){
        let expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new Stmt.Expression(expr);
    }    

    equality(){
        let expr = this.comparison();

        while(this.match([TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL])) {
            let operator = this.previous();
            let right = this.comparison();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    comparison(){
        let expr = this.term();

        while(this.match([TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL])) {
            let operator = this.previous();
            let right = this.term();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    term(){
        let expr = this.factor();
        while(this.match([TokenType.MINUS, TokenType.PLUS])) {
            let operator = this.previous();
            let right = this.factor();
            expr = new Expr.Binary(expr, operator, right);
        }
        return expr;
    }

    factor() {
        let expr = this.unary();
        while(this.match([TokenType.SLASH, TokenType.STAR])){
            let operator = this.previous();
            let right = this.unary();
            expr = new Expr.Binary(expr, operator, right);
        }
        return expr;
    }

    unary(){
        if(this.match([TokenType.BANG, TokenType.MINUS])) {
            let operator = this.previous();
            let right = this.unary();
            return new Expr.Unary(operator, right);
        }
        return this.primary();
    }

    primary(){
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
        for(let type of types){
            if(this.check(type)){
                this.advance();
                return true;
            }
        }
        return false;
    }

    consume(type, message){
        if(this.check(type)) return this.advance();

        throw this.error(this.peek(), message);
    }
    
    check(type){
        if(this.isAtEnd()) return false;

        return this.peek().type === type;
    }

    advance(){
        if(!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd(){
        return this.peek().type === TokenType.EOF
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
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