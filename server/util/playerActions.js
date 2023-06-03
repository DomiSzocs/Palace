import {getGameState, getLobbyById, updateGameState} from '../firebase/LobbiesDTO.js'

export const swapCards = async (room, state) => {
    const gameState = await getGameState(room);

    const temp = gameState.players[state.playerNumber].hand[state.hand];
    gameState.players[state.playerNumber].hand[state.hand] = gameState.players[state.playerNumber].faceUp[state.faceUp];
    gameState.players[state.playerNumber].faceUp[state.faceUp] = temp;
    await updateGameState(room, gameState);
    return gameState.players[state.playerNumber];
}
