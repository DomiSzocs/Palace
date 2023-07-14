import {firestore} from "./firebaseAdmin.js";
import GameOverError from "../errors/GameOverError.js";

export async function createGameState(room, gameState) {
    if (!room) return;
    if (!gameState) return;

    const gameStateRef = firestore.collection('gameStates').doc(room);
    const gameStateData = await gameStateRef.get();

    if (gameStateData.exists) return;

    await gameStateRef.set(gameState);
}

export async function updateGameState(room, gameState) {
    if (!room) return;
    if (!gameState) return;

    const gameStateRef = firestore.collection('gameStates').doc(room);
    const gameStateData = await gameStateRef.get();

    if (!gameStateData.exists) return;

    await gameStateRef.update(gameState);
}

export async function getGameStateById(room) {
    if (!room) return;

    const gameStateRef = firestore.collection('gameStates').doc(room);
    const gameStateData = await gameStateRef.get();

    if (!gameStateData.exists) return null;

    return gameStateData.data();
}

export async function deleteGameState(room) {
    if (!room) return;

    await firestore.collection('gameStates').doc(room).delete();
}

export async function deletePlayerFromGameState(room, uid) {
    if (!room) return;
    if (!uid) return;

    const gameStateData = await getGameStateById(room);

    if (!gameStateData) return;

    const index = gameStateData.players
        .findIndex(player => player.info.uid === uid);

    if (gameStateData.players[index].stillPlaying) {
        gameStateData.playersStillInMatch--;
    }

    gameStateData.numberOfPlayers--;

    if (!gameStateData.numberOfPlayers) {
        await deleteGameState(room);
    }

    await updateGameState(room, gameStateData)

    if (gameStateData.playersStillInMatch <= 1) {
        throw new GameOverError('Game Over');
    }
}
