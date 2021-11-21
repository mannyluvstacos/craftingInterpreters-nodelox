import { TokenType } from "./TokenType.js";
import { RuntimeError } from "./RuntimeError.js";

export class Interpreter {

    interpret(expression){
        try {
         let   value = this.evaluate(expression);
            console.log(this.stringify(value));
        } catch (error) {
            throw error
        }
    }

    visitLiteralExpr(expr){
        return expr.value
    }

    visitUnaryExpr(expr){
        let right = this.evaluate(expr.right);

        switch(expr.operator.type){
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right)
                return -1*parseFloat(right);
        }


        // unreachable code
        return null;
    }

    checkNumberOperand(operator, operand) {
        if(typeof(operand) === "number") return;
        throw new RuntimeError(operator,"Operand must be a number.")
    }

    checkNumberOperands(operator, left, right){
        if(typeof(left) === "number" && typeof(right) === "number") return;

        throw new RuntimeError(operator, "Operands must be numbers.");
    }

    isTruthy(object){
        if(object === null) return false;
        if( typeof(object) === 'boolean') return object;
        return true;
    }

    isEqual(a, b){
        if(a === null && b === null) return true;
        if(a === null) return false;

        return a === b;
    }

    stringify(object) {
        if(object === null) return "nil";

        if(typeof(object) === "number"){
            let text = object.toString();
            if(text.endsWith(".0")){
                text = text.substring(0,text.length()-2);
            }
            return text;
        }

        return object.toString();
    }

    visitGroupingExpr(expr){
        return this.evaluate(expr.expression);
    }

    evaluate(expr){
        return expr.accept(this);
    }

    visitBinaryExpr(expr){
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch(expr.operator.type) {
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return parseFloat(left) > parseFloat(right);
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return parseFloat(left) >= parseFloat(right);
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return parseFloat(left) < parseFloat(right);
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return parseFloat(left) <= parseFloat(right);
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return parseFloat(left) - parseFloat(right);
            case TokenType.PLUS:
                if(typeof(left) === "number" && typeof(right) === "number"){
                    return parseFloat(left) + parseFloat(right);
                }

                if(typeof(left)==="string" && typeof(right)==="string"){
                    return left.toString() + right.toString();
                }

                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                return parseFloat(left) / parseFloat(right);
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return parseFloat(left) * parseFloat(right);
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right)
        }

        //unreachable code
        return null;
    }
}