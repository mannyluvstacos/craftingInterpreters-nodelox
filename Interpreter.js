import { TokenType } from './TokenType.js'
import { RuntimeError } from './RuntimeError.js'
import { Environment } from './Environment.js'
import * as LoxCallable from './LoxCallable.js'
import * as LoxFunction from './LoxFunction.js'

export class Interpreter {


  environment = new Environment();

  interpret (statements) {
    try {
      for (const statement of statements) {
        this.execute(statement)
      }
    } catch (error) {
      return new RuntimeError(error)
    }
  }

  visitLiteralExpr (expr) {
    return expr.value
  }

  visitLogicalExpr(expr) {
    let left = this.evaluate(expr.left);

    if(expr.operator.type === TokenType.OR) {
      if(this.isTruthy(left)) return left;
    } else {
      if(!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitUnaryExpr (expr) {
    const right = this.evaluate(expr.right)

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right)
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right)
        return -1 * parseFloat(right)
    }

    // unreachable code
    return null
  }

  visitVariableExpr(expr) {
    return this.environment.get(expr.name);
  }

  checkNumberOperand (operator, operand) {
    if (typeof (operand) === 'number') return
    throw new RuntimeError(operator, 'Operand must be a number.')
  }

  checkNumberOperands (operator, left, right) {
    if (typeof (left) === 'number' && typeof (right) === 'number') return

    throw new RuntimeError(operator, 'Operands must be numbers.')
  }

  isTruthy (object) {
    if (object === null) return false
    if (typeof (object) === 'boolean') return object
    return true
  }

  isEqual (a, b) {
    if (a === null && b === null) return true
    if (a === null) return false

    return a === b
  }

  stringify (object) {
    if (object == null) return 'nil'

    if (typeof (object) === 'number') {
      let text = object.toString()
      if (text.endsWith('.0')) {
        text = text.substring(0, text.length() - 2)
      }
      return text
    }

    return object.toString()
  }

  visitGroupingExpr (expr) {
    return this.evaluate(expr.expression)
  }

  evaluate (expr) {
    return expr.accept(this)
  }

  execute (stmt) {
    stmt.accept(this)
  }

  executeBlock(statements, environment){
    const previous = this.environment;
    try {
      
      this.environment = environment;
      for(let statement of statements){
        this.execute(statement)
      }
    } finally{
      this.environment = previous
    }
  }

  visitBlockStmt(stmt){
    this.executeBlock(stmt.statements, new Environment(this.environment));
    return null;
  }

  visitExpressionStmt (stmt) {
    this.evaluate(stmt.expression)
    return null
  }

  visitIfStmt(stmt){
    if(this.isTruthy(this.evaluate(stmt.condition))){
      this.execute(stmt.thenBranch);
    } else if(stmt.elseBranch != null){
      this.execute(stmt.elseBranch);
    }
    return null;
  }

  visitPrintStmt (stmt) {
    const value = this.evaluate(stmt.expression)
    console.log(this.stringify(value))
    return null
  }

  visitVarStmt(stmt) {
    let value = null;
    if(!(stmt.initializer == null)) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
    return null;
  }

  visitWhileStmt(stmt){
    while(this.isTruthy(this.evaluate(stmt.condition))){
      this.execute(stmt.body);
    }
    return null;
  }

  visitAssignExpr(expr){
    let value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  visitBinaryExpr (expr) {
    const left = this.evaluate(expr.left)
    const right = this.evaluate(expr.right)

    switch (expr.operator.type) {
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right)
        return parseFloat(left) > parseFloat(right)
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right)
        return parseFloat(left) >= parseFloat(right)
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right)
        return parseFloat(left) < parseFloat(right)
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right)
        return parseFloat(left) <= parseFloat(right)
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right)
        return parseFloat(left) - parseFloat(right)
      case TokenType.PLUS:
        if (typeof (left) === 'number' && typeof (right) === 'number') {
          return parseFloat(left) + parseFloat(right)
        }

        if (typeof (left) === 'string' && typeof (right) === 'string') {
          return left.toString() + right.toString()
        }

        throw new RuntimeError(expr.operator, 'Operands must be two numbers or two strings.')
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right)
        return parseFloat(left) / parseFloat(right)
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right)
        return parseFloat(left) * parseFloat(right)
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right)
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right)
    }

    // unreachable code
    return null
  }

  visitCallExpr(expr) {
    let callee = this.evaluate(expr.callee);

    let arguments = [];

    for(argument of expr.arguments){
      arguments.push(this.evaluate(argument));
    }

    if(!(callee instanceof LoxCallable)) {
      throw new RuntimeError(expr.paraen, "Can only call functions and classes.");
    }

    let func = new LoxFunction(callee);
    return func.call(this, arguments);
  }
}
