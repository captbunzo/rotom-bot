
export default class PermissionError extends Error {
    constructor(message){
        super();
        this.message = message;
    }
}
