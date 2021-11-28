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
        //DEBUG console.log('parse', {statements})
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
            // DEBUG console.log({currentStatement})
            return currentStatement
        } catch (error) {
            this.syncrhonize();
            return null;
        }
    }

    statement(){
        let statement = null;
        if(this.match([TokenType.FOR])) {
             statement = this.forStatement();
             //DEBUG console.log('for',{statement})
            return statement
        }
        if(this.match([TokenType.IF])) {
             statement = this.ifStatement();
             //DEBUG console.log('if',{statement})
            return statement
        }
        if(this.match([TokenType.PRINT])) {
             statement = this.printStatement();
             //DEBUG console.log('print',{statement})
            return statement
        }
        if(this.match([TokenType.WHILE])) {
             statement = this.whileStatement();
             //DEBUG console.log('while',{statement})
            return statement
        }
        if(this.match([TokenType.LEFT_BRACE])) {
             statement = new Stmt.Block(this.block());
             //DEBUG console.log('left brace',{statement})
            return statement
        }
        statement = this.expressionStatement();
        //DEBUG console.log('statement', {statement})
        return statement
    }

    forStatement(){
        
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");

        //initializer
        let initializer = null;
        if(this.match([TokenType.SEMICOLON])){
            initializer = null;
        } else if(this.match([TokenType.VAR])){
            initializer = this.varDeclaration();
            //DEBUG console.log('initializer present', {initializer})
        } else {
            initializer = this.expressionStatement();
        }

        //DEBUG console.log({initializer})

        //condition
        let condition = null;
        if(!this.check(TokenType.SEMICOLON)){
            condition = this.expression()
        }
        this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

        //DEBUG console.log({condition})
        //increment
        let increment = null;
        if(!this.check(TokenType.RIGHT_PAREN)){
            increment = this.expression();
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

        //DEBUG console.log({increment})
        //Body

        let body = this.statement();

        if(increment != null) {
            //DEBUG console.log('increment not null, assigning...')
            body = new Stmt.Block(
                [
                    body,
                    new Stmt.Expression(increment)
                ]
            );
            //DEBUG console.log('assigned increment', {body})
        }

        if(condition == null) {
            //DEBUG console.log('condition is null')
            condition = new Expr.Literal(true);
            //DEBUG console.log('condition was null, now assigned', {condition})
        }

        //DEBUG console.log('Desugaring using while loop')
        body = new Stmt.While(condition, body);
        //DEBUG console.log('Desugared', {body});

        if(initializer != null) {
            body = new Stmt.Block([initializer, body]);
        }
        //DEBUG console.log({body})
        return body;
    }

    ifStatement(){
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
        const condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

        const thenBranch = this.statement();
        let elseBranch = null;
        if(this.match([TokenType.ELSE])){
            elseBranch = this.statement();
        }

        return new Stmt.If(condition, thenBranch, elseBranch);
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

    whileStatement() {
        //DEBUG console.log('inside whileStatement')
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
        let condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
        let body = this.statement();

        //DEBUG console.log('whileStatement', {condition, body})
        return new Stmt.While(condition, body);
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
        let expr = this.or();

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

    or() {
        let expr = this.and();

        while(this.match([TokenType.OR])) {
            let operator = this.previous();
            let right = this.and();
            expr = new Expr.Logical(expr, operator, right)
        }

        return expr;
    }

    and() {
        let expr = this.equality();

        while(this.match([TokenType.AND])){
            let operator = this.previous();
            let right = this.equality();
            expr = new Expr.Logical(expr, operator, right);
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
        return this.call();
    }

    call(){
        let expr = this.primary();

        while(true) {
            if(this.match([TokenType.LEFT_PAREN])){
                expr = this.finishCall(expr);
            } else {
                break;
            }
        }

        return expr;
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
            //DEBUG console.log({type,typeCheck});
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