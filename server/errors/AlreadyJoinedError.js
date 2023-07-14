export default class AlreadyJoinedError extends Error {
    constructor(message) {
        super(message);
        this.name = "AlreadyJoinedError";
    }
}
