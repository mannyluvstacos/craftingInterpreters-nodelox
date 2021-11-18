import * as Expr from './Expr.js'
import { Token } from './Token.js';
import {TokenType} from './TokenType.js'


class AstPrinter {
    print(expr){
        return expr.accept(this);
    }

//     public String visitBinaryExpr(Expr.Binary expr) {
//         return parenthesize(expr.operator.lexeme,
//                             expr.left, expr.right);
//       }

visitBinaryExpr(expr){
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
}
    
//       @Override
//       public String visitGroupingExpr(Expr.Grouping expr) {
//         return parenthesize("group", expr.expression);
//       }

visitGroupingExpr(expr){
    return this.parenthesize("group", expr.expression);
}
    
//       @Override
//       public String visitLiteralExpr(Expr.Literal expr) {
//         if (expr.value == null) return "nil";
//         return expr.value.toString();
//       }

visitLiteralExpr(expr){
    if(expr.value === null) return "nil";
    return expr.value.toString();
}
    
//       @Override
//       public String visitUnaryExpr(Expr.Unary expr) {
//         return parenthesize(expr.operator.lexeme, expr.right);
//       }

visitUnaryExpr(expr){
    return this.parenthesize(expr.operator.lexeme, expr.right);
}

parenthesize(name, ...exprs){
    let builtString= ""
    builtString += "("+name;
    for(let expr of exprs){
        builtString += " ";
        builtString += String(expr.accept(this))
    }
    builtString += ")";

    return builtString
}

main(){
    let expression = new Expr.Binary(new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(123)),
    new Token(TokenType.STAR, "*", null, 1),
    new Expr.Grouping(
        new Expr.Literal(45.67)));

        console.log(new AstPrinter().print(expression));

}

}

(()=>{
    let ast = new AstPrinter();
    ast.main()
  })();