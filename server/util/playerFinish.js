export const handlePlayerFinish = (socket, gameState, player) => {
    if (!isPlayerFinished(gameState.players[player])) return;

    gameState.players[player].stillPlaying = false;
    gameState.playersStillInMatch--;
    gameState.playersFinished++;
    gameState.players[player].finishedAs = gameState.numberOfPlayers - gameState.playersStillInMatch;
    socket.emit('finished');
}

const isPlayerFinished = (player) => {
    return player.hand.length === 0 && player.faceDown.length === 0;
}
