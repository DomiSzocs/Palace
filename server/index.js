import 'dotenv/config';
import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import morgan from 'morgan';
import lobbyApi from './api/lobbyApi.js'
import Dealer from './util/dealer.js';
import {swapCards} from "./util/playerActions.js";
import {updateUsersPoints} from "./firebase/usersDAO.js";
import userApi from "./api/userApi.js";
import {verifyToken} from "./middlewares/authMiddleWare.js";
import HostLeftError from "./errors/HostLeftError.js";
import GameOverError from "./errors/GameOverError.js";
import {
    deletePlayerFromLobby,
    getHost,
    getLobbyById,
    updateLobby
} from './firebase/lobbiesDAO.js'
import {
    createGameState,
    deletePlayerFromGameState,
    getGameStateById,
    updateGameState
} from "./firebase/gameStatesDAO.js";

const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.CLIENT_APP } });

function broadcastIntoRoomWithEvent (socket, room, ev,  data) {
    socket.emit(ev, data);
    socket.to(room).emit(ev, data);
}

io.on('connection', (socket) => {
    socket.on('join', async ({room}) => {
        console.log(`Joined: ${room}`)
        socket.join(room);
        const lobbyData = await getLobbyById(room);
        broadcastIntoRoomWithEvent(socket, room, 'joined', lobbyData.players);
    });

    socket.on('amIHost', async ({user, room}) => {
        const host = await getHost(room);
        socket.emit('amIHostAnswer', host === user);
    })

    socket.on('send', (data) => {
        broadcastIntoRoomWithEvent(socket, data.room, 'receive', data); //TODO concat name
    });

    socket.on('disconnecting...', async ({room, user}) => {
        try {
            await deletePlayerFromLobby(room, user);
            await deletePlayerFromGameState(room, user)
        } catch (error) {
            if (error instanceof HostLeftError) {
                broadcastIntoRoomWithEvent(socket, room, 'host_disconnected', null);
            } else if (error instanceof GameOverError) {
                broadcastIntoRoomWithEvent(socket, room, 'gameOver', null);
            } else {
                console.log(error);
            }
        }
    });

    socket.on('gameStart', async ({room}) => {
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
    });

    socket.on('playerAction', async (req) => {
        const state = {
            playerNumber: req.serverIndex,
            hand: req.hand,
            faceUp: req.faceUp
        }
        const newState = await swapCards(req.room, state);
        const res = {player: req.uid, hand: newState};
        broadcastIntoRoomWithEvent(socket, req.room, 'updateHand', res);
    });

    socket.on('ready', async (room) => {
        const gameState = await getGameStateById(room);

        if (!gameState) return;

        gameState.playersNotReady--;

        if (gameState.playersNotReady === 0) {
            const firstPlayer = getFirstPlayer(gameState.players);
            gameState.nextPlayer = firstPlayer;
            broadcastIntoRoomWithEvent(socket, room, 'nextPlayer', firstPlayer.uid);
        }

        await updateGameState(room, gameState);
    });

    socket.on('playCards', async ({cards, origin, player, room}) => { //TODO refactor
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
    });

    socket.on('tryCard', async ({card, origin, player, room}) => { //TODO refactor
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
    });

    socket.on('takeCentralPile', async ({room, player}) => {
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
    });

    socket.on('sortHand', async ({room, player}) => {
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
    });

    socket.on('setVisibility', async ({room, state}) => {
        const lobbyData = await getLobbyById(room);

        if (!lobbyData) return;

        lobbyData.isPublic = state;

        broadcastIntoRoomWithEvent(socket, room, 'setSwitch', state);

        await updateLobby(room, lobbyData);
    });

    socket.on('getSwitchState', async ({room}) => {
        const lobbyData = await getLobbyById(room);

        if (!lobbyData) return;

        broadcastIntoRoomWithEvent(socket, room, 'setSwitch', lobbyData.isPublic);
    });
});

const getCardToPlay = (origin, card, gameState, player) => {
    let container;
    if (origin === 'deck') {
        container = gameState.drawingPile;
    } else {
        container = gameState.players[player][origin];
    }

    return container.splice(card, 1)[0];
}

const handlePlayerFinish = (socket, gameState, player) => {
    if (!isPlayerFinished(gameState.players[player])) return;

    gameState.players[player].stillPlaying = false;
    gameState.playersStillInMatch--;
    gameState.playersFinished++;
    gameState.players[player].finishedAs = gameState.numberOfPlayers - gameState.playersStillInMatch;
    socket.emit('finished');
}

const handleGameOver = (socket, gameState, room) => {
    if(!isGameOver(gameState.playersStillInMatch)) return;

    const playerPoints = calculatePoints(gameState);
    updateUsersPoints(playerPoints).then();
    broadcastIntoRoomWithEvent(socket, room, 'gameOver', playerPoints);
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

const isPlayerFinished = (player) => {
    return player.hand.length === 0 && player.faceDown.length === 0;
}

const isGameOver = (playersStillInMatch) => {
    return playersStillInMatch <= 1;
}

const addToCentralPile = (card, centralPile) => {
    centralPile.push(card)

    const fourOfAKind = checkIfFourOfAKind(centralPile.slice(-4));

    if (card.rank === '10' || fourOfAKind) {
        centralPile = [];
    }

    return centralPile;
}

const addCardsToPlayerHand = (hand, cards) => {
    const newPlayerHand = [...hand];
    cards.forEach(card => {
        if (card.rank !== 'JOKER') {
            newPlayerHand.push(card)
        }
    })

    return newPlayerHand;
}

const getTheNextPlayer = (current, players, tryToKeepCurrent) => {
    const numberOfPlayers = players.length;
    let index = current.index;

    if (!tryToKeepCurrent) {
        index = (index + 1) % numberOfPlayers;
    }

    while (!players[index].stillPlaying) {
        index = (index + 1) % numberOfPlayers;
    }
    const uid = players[index].info.uid;
    return {index, uid};
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

const addCardsToCentralPile = (centralPile, cards, indexes) => {
    const topCard = centralPile.slice(-1);
    const firstCard = cards[indexes[0]];

    if (!isPlayable(firstCard, topCard)) return

    const playedCards = indexes.map(index => cards[index]);

    let usedHand = [];
    for (let i = 0; i < cards.length; i++) {
        if (indexes.includes(i)) continue;

        usedHand.push(cards[i]);
    }

    let updatedCentralPile = centralPile.concat(playedCards);

    const fourOfAKind = checkIfFourOfAKind(updatedCentralPile.slice(-4));

    if (firstCard.rank === '10' || fourOfAKind) {
        updatedCentralPile = [];
    }

    return {playedCards, updatedCentralPile, usedHand};
}

const isPlayable = (card, topCard) => {
    const cardValues = getCardsValues();

    return !topCard.length || topCard[0].rank === '2' || cardValues[card.rank] >= cardValues[topCard[0].rank];
}

const checkIfFourOfAKind = (cards) => {
    if (cards.length < 4) return false;

    const reference = cards[0].rank;
    return cards.every(card => card.rank === reference);
}

const getFirstPlayer = (players) => {
    const hands = []
    for(let i = 0; i < players.length; i++) {
        const playerHandCopy = [...players[i].hand];
        const sorted = playerHandCopy.sort(sortCards);
        hands.push({
            best: sorted[0].rank,
            second: sorted[1].rank,
            third: sorted[2].rank,
            player: i,
            uid: players[i].info.uid
        });
    }
    hands.sort(sortHands);
    return {
        index: hands[0].player,
        uid: hands[0].uid
    };
};

const sortHands = (a, b) => {
    if (a.best < b.best) {
        return -1;
    }

    if (a.best > b.best) {
        return 1;
    }

    if (a.second < b.second) {
        return -1;
    }

    if (a.second > b.second) {
        return 1;
    }

    if (a.third < b.third) {
        return -1;
    }

    if (a.third > b.third) {
        return 1;
    }

    if (a.player > b.player) {
        return -1;
    }

    if (a.player >= b.player) {
        return 1;
    }
}

const sortCards = (a, b) => {
    const cardValues = getCardsValues();
    return cardValues[a.rank] < cardValues[b.rank] ? -1 : 1;
}

const getCardsValues = () => {
    return {'3': 0, '4': 1, '5': 2, '6': 3, '7': 4, '8': 5, '9': 6,
        'J': 7, 'Q': 8,'K': 9, 'A': 10, '2': 11, '10': 12, 'JOKER': 13};
}

const cardToObject = (card) => {
    return {
        suit: card.suit,
        rank: card.rank
    };
};

function calculateDecksNeeded(players) {
    return Math.floor((players - 1) / 3) + 1;
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

app.use(morgan('tiny'));

app.use(express.json());

app.use(verifyToken);

app.use(lobbyApi);

app.use(userApi);

server.listen(3001, () => {
    console.log('Server started on port 3001');
});

