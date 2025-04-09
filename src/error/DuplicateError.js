
export default class DuplicateError extends Error {
    constructor(message){
        super();
        this.message = message;
    }
}
