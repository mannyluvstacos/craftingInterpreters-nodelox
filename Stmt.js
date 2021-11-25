export class Stmt {
}
export class Block extends Stmt {  constructor( statements ) {
super();
    this.statements = statements;
  }
  accept(visitor) {
  return visitor.visitBlockStmt(this);
    }  statements;
}
export class Expression extends Stmt {  constructor( expression ) {
super();
    this.expression = expression;
  }
  accept(visitor) {
  return visitor.visitExpressionStmt(this);
    }  expression;
}
export class If extends Stmt {  constructor( condition,thenBranch,elseBranch ) {
super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
  accept(visitor) {
  return visitor.visitIfStmt(this);
    }  condition;
  thenBranch;
  elseBranch;
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
export class While extends Stmt {  constructor( condition,body ) {
super();
    this.condition = condition;
    this.body = body;
  }
  accept(visitor) {
  return visitor.visitWhileStmt(this);
    }  condition;
  body;
}

