export class RuntimeError extends Error {
    token;

    constructor(token, message){
        super(message)
        this.token = token;
    }
}