
// TODO - Delete this file after checking if it is used anywhere
export default class DuplicateError extends Error {
    constructor(message: any){
        super();
        this.message = message;
    }
}
