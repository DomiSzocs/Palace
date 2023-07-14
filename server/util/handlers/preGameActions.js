import {createGameState, getGameStateById, updateGameState} from "../../firebase/gameStatesDAO.js";
import {getLobbyById, updateLobby} from "../../firebase/lobbiesDAO.js";
import Dealer from "../dealer.js";
import {broadcastIntoRoomWithEvent} from "../broadcastEvent.js";
import {cardToObject} from "../card.js";
import {getFirstPlayer} from "../getPlayerOnDuty.js";

export const onGameStart = async (room, socket) => {
    try {
        const data = await getLobbyById(room);

        if (!data) return;

        const gameState = buildGameState(data.players);

        broadcastIntoRoomWithEvent(socket, room, 'starting...', null);
        broadcastIntoRoomWithEvent(socket, room, 'startingState', gameState);

        await createGameState(room, gameState);
        await updateLobby(room, {started: true});
    } catch(error) {
        console.log(error);
    }
}

export const onSwap = async (req, socket) => {
    const state = {
        playerNumber: req.serverIndex,
        hand: req.hand,
        faceUp: req.faceUp
    }
    const newState = await swapCards(req.room, state);
    const res = {player: req.uid, hand: newState};
    broadcastIntoRoomWithEvent(socket, req.room, 'updateHand', res);
}

export const onReady = async (room, socket) => {
    const gameState = await getGameStateById(room);

    if (!gameState) return;

    gameState.playersNotReady--;

    if (gameState.playersNotReady === 0) {
        const firstPlayer = getFirstPlayer(gameState.players);
        gameState.nextPlayer = firstPlayer;
        broadcastIntoRoomWithEvent(socket, room, 'nextPlayer', firstPlayer.uid);
    }

    await updateGameState(room, gameState);
}

const swapCards = async (room, state) => {
    const gameState = await getGameStateById(room);

    const temp = gameState.players[state.playerNumber].hand[state.hand];
    gameState.players[state.playerNumber].hand[state.hand] = gameState.players[state.playerNumber].faceUp[state.faceUp];
    gameState.players[state.playerNumber].faceUp[state.faceUp] = temp;
    await updateGameState(room, gameState);
    return gameState.players[state.playerNumber];
}

const buildGameState = (players) => {
    const numberOfDeck = calculateDecksNeeded(players.length);
    const dealer = new Dealer(players, numberOfDeck);
    const hands = dealer.deal();

    const drawingPile = dealer.deck.cards.map(cardToObject);

    const playersStates = hands.map((hand) => {
        return {
            faceDown: hand.faceDown.map(cardToObject),
            faceUp: hand.faceUp.map(cardToObject),
            hand: hand.hand.map(cardToObject),
            info: hand.info,
            stillPlaying: true,
        };
    });

    return {
        players: playersStates,
        numberOfPlayers: playersStates.length,
        drawingPile: drawingPile,
        centralPile: [],
        playersStillInMatch: playersStates.length,
        playersFinished: 0,
        playersNotReady: playersStates.length,
    };
}
const calculateDecksNeeded = (players) => {
    return Math.floor((players - 1) / 3) + 1;
}
