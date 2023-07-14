export default class LobbyAlreadyExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = "LobbyAlreadyExistsError";
    }
}
