export default class LobbyAlreadyStartedError extends Error {
    constructor(message) {
        super(message);
        this.name = "LobbyAlreadyStartedError";
    }
}
