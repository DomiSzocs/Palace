export default class GameOverError extends Error {
    constructor(message) {
        super(message);
        this.name = "GameOverError";
    }
}
