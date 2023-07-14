export default class LobbyDoesNotExistError extends Error {
    constructor(message) {
        super(message);
        this.name = "LobbyDoesNotExistError";
    }
}
