import { RuntimeError } from "./RuntimeError.js";

export class Environment {
    values;

    constructor(){
        this.values = new Map();
    }

    get(name){
        if(this.values.has(name.lexeme)){
            return this.values.get(name.lexeme);
        }

        throw new RuntimeError(name, "Undefined variable '", + name.lexeme + "'.");
    }

    asign(name, value){
        if(this.values.has(name.lexeme)){
            this.values.set(name.lexeme, value);
            return;
        }

        throw new RuntimeError(name, "Undefined variable '" + name.lexeme +"'.");
    }

    define(name, value) {
        this.values.set(name, value)
    }
}