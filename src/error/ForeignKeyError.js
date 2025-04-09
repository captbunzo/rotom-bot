
export default class ForeignKeyError extends Error {
    constructor(message){
        super();
        this.message = message;
    }
}
