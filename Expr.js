export class Expr {
}
export class Assign extends Expr {  constructor( name,value ) {
super();
    this.name = name;
    this.value = value;
  }
  accept(visitor) {
  return visitor.visitAssignExpr(this);
    }  name;
  value;
}
export class Binary extends Expr {  constructor( left,operator,right ) {
super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  accept(visitor) {
  return visitor.visitBinaryExpr(this);
    }  left;
  operator;
  right;
}
export class Grouping extends Expr {  constructor( expression ) {
super();
    this.expression = expression;
  }
  accept(visitor) {
  return visitor.visitGroupingExpr(this);
    }  expression;
}
export class Literal extends Expr {  constructor( value ) {
super();
    this.value = value;
  }
  accept(visitor) {
  return visitor.visitLiteralExpr(this);
    }  value;
}
export class Unary extends Expr {  constructor( operator,right ) {
super();
    this.operator = operator;
    this.right = right;
  }
  accept(visitor) {
  return visitor.visitUnaryExpr(this);
    }  operator;
  right;
}
export class Variable extends Expr {  constructor( name ) {
super();
    this.name = name;
  }
  accept(visitor) {
  return visitor.visitVariableExpr(this);
    }  name;
}

