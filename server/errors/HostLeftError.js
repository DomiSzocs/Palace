export default class HostLeftError extends Error {
    constructor(message) {
        super(message);
        this.name = "HostLeftError";
    }
}
