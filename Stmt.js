export class Stmt {
}
export class Expression extends Stmt {  constructor( expression ) {
super();
    this.expression = expression;
  }
  accept(visitor) {
  return visitor.visitExpressionStmt(this);
    }  expression;
}
export class Print extends Stmt {  constructor( expression ) {
super();
    this.expression = expression;
  }
  accept(visitor) {
  return visitor.visitPrintStmt(this);
    }  expression;
}
export class Var extends Stmt {  constructor( name,initializer ) {
super();
    this.name = name;
    this.initializer = initializer;
  }
  accept(visitor) {
  return visitor.visitVarStmt(this);
    }  name;
  initializer;
}

