import * as Expr from "./Expr.js";
import * as Stmt from "./Stmt.js";
import { TokenType } from "./TokenType.js";
import * as err from "./error.js"
import { Token } from "./Token.js";

export class Parser {
    tokens = [];
    current = 0;
    
    constructor(tokens){
        this.tokens = tokens
    }

    parse(){
        let statements = [];
        while(!this.isAtEnd()){
            statements.push(this.declaration());
        }

        return statements;
    }

    expression(){
        return this.assignment();
    }

    declaration(){
        try {
            const tokenMatch = this.match([TokenType.VAR]);
            if(tokenMatch) {
                let varDeclaration = this.varDeclaration();
                return varDeclaration
            }
            const currentStatement = this.statement();
            return currentStatement
        } catch (error) {
            this.syncrhonize();
            return null;
        }
    }

    statement(){
        if(this.match([TokenType.PRINT])) return this.printStatement();
        if(this.match([TokenType.LEFT_BRACE])) return new Stmt.Block(this.block());

        return this.expressionStatement();
    }

    printStatement(){
        let value = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Stmt.Print(value);
    }

    varDeclaration() {
        let name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
        let initializer = null;
        if(this.match([TokenType.EQUAL])){
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        return new Stmt.Var(name, initializer);
    }

    expressionStatement(){
        let expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new Stmt.Expression(expr);
    }
    
    block() {
        let statements = [];
        while(!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()){
            statements.push(this.declaration());
        }
        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
        return statements;
    }
    assignment() {
        let expr = this.equality();

        if(this.match([TokenType.EQUAL])) {
            let equals = this.previous();
            let value = this.assignment();

            const instanceOfVariable =  expr instanceof Expr.Variable;
            if(instanceOfVariable) {
                let name = expr.name;
                let expressionAssignment = new Expr.Assign(name, value);
                return expressionAssignment;
            }

            err.error(equals, "Invalid assignment target.");
        }

        return expr;
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

        if(this.match([TokenType.IDENTIFIER])){
            return new Expr.Variable(this.previous());
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
            const typeCheck = this.check(type)
            if(typeCheck){
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
        const isAtEnd = this.isAtEnd();
        if(isAtEnd) return false;

        const peekType = this.peek().type;
        return peekType === type;
    }

    advance(){
        if(!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd(){
        return this.peek().type === TokenType.EOF
    }

    peek() {
        const peek = this.tokens[this.current];
        return peek;
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
            this.advance();
        }
    }
}

class ParseError extends Error {

}