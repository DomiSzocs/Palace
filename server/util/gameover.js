import {updateUsersPoints} from "../firebase/usersDAO.js";
import {broadcastIntoRoomWithEvent} from "./broadcastEvent.js";

export const handleGameOver = (socket, gameState, room) => {
    if(!isGameOver(gameState.playersStillInMatch)) return;

    const playerPoints = calculatePoints(gameState);
    updateUsersPoints(playerPoints).then();
    broadcastIntoRoomWithEvent(socket, room, 'gameOver', playerPoints);
}

const isGameOver = (playersStillInMatch) => {
    return playersStillInMatch <= 1;
}

const calculatePoints = (gameState) => {
    const finishers = gameState.numberOfPlayers;
    const playersPoints = []
    gameState.players.forEach((player) => {
        let points = 0;
        if (player.finishedAs) {
            points = finishers - player.finishedAs;
        }
        if (player.finishedAs === 1) {
            points++;
        }
        playersPoints.push({uid: player.info.uid, points: points, name: player.info.name});
    });
    gameState.playersPoints = playersPoints;
    return playersPoints;
}
