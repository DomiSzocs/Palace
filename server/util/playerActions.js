import {getGameStateById, getLobbyById, updateGameState} from '../firebase/lobbiesDAO.js'

export const swapCards = async (room, state) => {
    const gameState = await getGameStateById(room);

    const temp = gameState.players[state.playerNumber].hand[state.hand];
    gameState.players[state.playerNumber].hand[state.hand] = gameState.players[state.playerNumber].faceUp[state.faceUp];
    gameState.players[state.playerNumber].faceUp[state.faceUp] = temp;
    await updateGameState(room, gameState);
    return gameState.players[state.playerNumber];
}
