import {getGameStateById, updateGameState} from "../../firebase/gameStatesDAO.js";
import {broadcastIntoRoomWithEvent} from "../broadcastEvent.js";
import {getTheNextPlayer} from "../getPlayerOnDuty.js";
import {addCardsToCentralPile, addCardsToPlayerHand, addToCentralPile, isPlayable} from "../cardTransfers.js";
import {handlePlayerFinish} from "../playerFinish.js";
import {handleGameOver} from "../gameover.js";
import {sortCards} from "../sorts.js";

export const onPlayCards = async (room, player, cards, origin, socket) => {
    const gameState = await getGameStateById(room);

    if (!gameState) return;

    const updates = addCardsToCentralPile(gameState.centralPile, gameState.players[player][origin], cards);

    if (!updates) return;

    const {hand, drawingPile} = completeHand(origin, gameState.drawingPile, updates.usedHand)

    gameState.players[player][origin] = hand;
    gameState.centralPile = updates.updatedCentralPile;
    gameState.drawingPile = drawingPile
    const updatedHand = {player: gameState.players[player].info.uid, hand:gameState.players[player]}

    broadcastIntoRoomWithEvent(socket, room, 'updateHand', updatedHand);
    broadcastIntoRoomWithEvent(socket, room, 'updateDrawingPile', drawingPile.length !== 0);

    let tryToKeepCurrent = true;
    let cardsToCentralPile = [];
    if (updates.updatedCentralPile.length) {
        tryToKeepCurrent = false;
        cardsToCentralPile = updates.playedCards;
    }

    broadcastIntoRoomWithEvent(socket, room, 'updateCentralPile', cardsToCentralPile);

    handlePlayerFinish(socket, gameState, player);
    handleGameOver(socket, gameState, room);

    gameState.nextPlayer = getTheNextPlayer(gameState.nextPlayer, gameState.players, tryToKeepCurrent);
    broadcastIntoRoomWithEvent(socket, room, 'nextPlayer', gameState.nextPlayer.uid);

    await updateGameState(room, gameState);
}

export const onTryCard = async (room, player, card, origin, socket) => {
    const gameState = await getGameStateById(room);

    if (!gameState) return;

    const cardToPlay = getCardToPlay(origin, card, gameState, player);

    let updateOnCentralPile = [cardToPlay];
    let tryToKeepCurrent = false;
    if (isPlayable(cardToPlay, gameState.centralPile.slice(-1))) {
        const updatedCentralPile = addToCentralPile(cardToPlay, gameState.centralPile);
        if (updatedCentralPile.length === 0) {
            tryToKeepCurrent = true;
            gameState.centralPile = [];
            updateOnCentralPile = [];
        }
    } else {
        gameState.players[player].hand = addCardsToPlayerHand(gameState.players[player].hand, gameState.centralPile);
        gameState.players[player].hand = addCardsToPlayerHand(gameState.players[player].hand, [cardToPlay]);
        gameState.centralPile = [];
        updateOnCentralPile = [];
    }

    const updateHandObject = {
        player: gameState.players[player].info.uid,
        hand: gameState.players[player]
    }

    broadcastIntoRoomWithEvent(socket, room, 'updateHand', updateHandObject);
    broadcastIntoRoomWithEvent(socket, room, 'updateCentralPile', updateOnCentralPile);
    broadcastIntoRoomWithEvent(socket, room, 'updateDrawingPile', gameState.drawingPile.length !== 0);

    handlePlayerFinish(socket, gameState, player);
    handleGameOver(socket, gameState, room);

    gameState.nextPlayer = getTheNextPlayer(gameState.nextPlayer, gameState.players, tryToKeepCurrent);
    broadcastIntoRoomWithEvent(socket, room, 'nextPlayer', gameState.nextPlayer.uid);

    await updateGameState(room, gameState);
}

export const onTakeCentralPile = async (room, player, socket) => {
    const gameState = await getGameStateById(room);

    if (!gameState) return;

    gameState.players[player].hand = addCardsToPlayerHand(gameState.players[player].hand, gameState.centralPile);

    gameState.centralPile = [];
    gameState.nextPlayer = getTheNextPlayer(gameState.nextPlayer, gameState.players, false)

    const updateHandResp = {
        player: gameState.players[player].info.uid,
        hand: gameState.players[player]
    }

    broadcastIntoRoomWithEvent(socket, room, 'updateHand', updateHandResp);
    broadcastIntoRoomWithEvent(socket, room, 'updateCentralPile', gameState.centralPile);
    broadcastIntoRoomWithEvent(socket, room, 'nextPlayer', gameState.nextPlayer.uid);

    await updateGameState(room, gameState);
}

export const onSortHand = async (room, player, socket) => {
    const gameState = await getGameStateById(room);

    if (!gameState) return;

    gameState.players[player].hand.sort(sortCards);

    let isCurrentPlayer = false;
    if (gameState.nextPlayer) {
        isCurrentPlayer = gameState.nextPlayer.index === player;
    }

    const sortedHandResp = {
        hand: gameState.players[player].hand,
        isCurrentPlayer: isCurrentPlayer
    };
    socket.emit('sortedHand', sortedHandResp);

    await updateGameState(room, gameState);
}

const getCardToPlay = (origin, card, gameState, player) => {
    let container;
    if (origin === 'deck') {
        container = gameState.drawingPile;
    } else {
        container = gameState.players[player][origin];
    }

    return container.splice(card, 1)[0];
}

const completeHand = (origin, drawingPile, playerHand) => {
    let updatedPlayerHand = [...playerHand];
    if (playerHand.length < 3) {
        const cardsNeeded = 3 - playerHand.length;
        const cardsToDraw = drawingPile.splice(-cardsNeeded);
        updatedPlayerHand = playerHand.concat(cardsToDraw);
    }

    return {hand: updatedPlayerHand, drawingPile: drawingPile};
}
