import 'dotenv/config';
import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import morgan from 'morgan';
import lobbyApi from './api/lobbyApi.js'
import {
    deletePlayerFromLobby,
    getGameState,
    getHost,
    getLobbyById,
    setGameState,
    updateGameState,
    updateLobby
} from './firebase/LobbiesDTO.js'
import Dealer from './util/dealer.js';
import {swapCards} from "./util/playerActions.js";
import {updateUsersPoints} from "./firebase/UsersDTO.js";
import userApi from "./api/userApi.js";
import {verifyToken} from "./middlewares/authMiddleWare.js";

const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.CLIENT_APP } });

function broadcastIntoRoomWithEvent (socket, room, ev,  data) {
    socket.emit(ev, data);
    socket.to(room).emit(ev, data);
}

io.on('connection', (socket) => {
    socket.on('join', async ({room, user}) => {
        console.log(`Joined: ${room}`)
        socket.join(room);
        const lobbyData = await getLobbyById(room);
        broadcastIntoRoomWithEvent(socket, room, 'joined', lobbyData.players);
    });

    socket.on('amIHost', ({user, room}) => {
        getHost(room)
            .then((host) => {
                socket.emit('amIHostAnswer', host === user);
            })
            .catch(error => console.log(error.message));
    })

    socket.on('send', (data) => {
        console.log("sending: " + data.message)
        console.log("sending: " + data.room)
        broadcastIntoRoomWithEvent(socket, data.room, 'receive', data);
    });

    socket.on('disconnecting...', ({room, user}) => {
        broadcastIntoRoomWithEvent(socket, room, 'playerLeft', user);
        deletePlayerFromLobby(room, user)
            .then((returnValue) => {
                if (returnValue === -1) {
                    console.log(`${room} host left`)
                    broadcastIntoRoomWithEvent(socket, room, 'host_disconnected', null);
                } else if (returnValue === 1) {
                    console.log(`${room}: gameOver`);
                    broadcastIntoRoomWithEvent(socket, room, 'gameOver', null);
                }
                console.log(`Socket disconnected ID: ${user} from ${room}`);
            })
            .catch(error => console.log(error.message))
    });

    socket.on('gameStart', async ({room}) => {
        try {
            const data = await getLobbyById(room);
            const gameState = buildGameState(data);
            broadcastIntoRoomWithEvent(socket, room, 'starting...', null);
            broadcastIntoRoomWithEvent(socket, room, 'startingState', gameState);
            await setGameState(room, gameState, true);
        } catch(error) {
            console.log(error);
        }
    });

    socket.on('playerAction', async (req) => {
        switch (req.action) {
            case 'swap': {
                const state = {
                    playerNumber: req.serverIndex,
                    hand: req.hand,
                    faceUp: req.faceUp
                }
                const newState = await swapCards(req.room, state);
                const res = {player: req.uid, hand: newState};
                broadcastIntoRoomWithEvent(socket, req.room, 'updateHand', res);
                break;
            }
            default: {
                socket.emit('incorrectAction');
            }
        }
    });

    socket.on('ready', async (room) => {
        const lobbyData = await getLobbyById(room);
        const update = {};
        if (lobbyData.data.playersNotReady === 1) {
            const firstPlayer = getFirstPlayer(lobbyData.data.gameState.players);
            update.gameState = lobbyData.data.gameState;
            update.gameState.nextPlayer = firstPlayer;
            broadcastIntoRoomWithEvent(socket, room, 'nextPlayer', firstPlayer.uid);
        }

        update.playersNotReady = lobbyData.data.playersNotReady - 1;
        await updateLobby(room, update);
    });

    socket.on('playCards', async ({cards, origin, player, room}) => {
        const gameState = await getGameState(room);
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

        const nextPlayer = getTheNextPlayer(gameState.nextPlayer, gameState.players, tryToKeepCurrent);

        broadcastIntoRoomWithEvent(socket, room, 'updateCentralPile', cardsToCentralPile);

        gameState.centralPile = updates.updatedCentralPile;
        gameState.drawingPile = drawingPile;
        gameState.nextPlayer = nextPlayer;

        broadcastIntoRoomWithEvent(socket, room, 'nextPlayer', nextPlayer.uid);

        handlePlayerFinish(socket, gameState, player);
        handleGameOver(socket, gameState, room);

        await updateGameState(room, gameState);
    });

    socket.on('takeCentralPile', async ({room, player}) => {
        const gameState = await getGameState(room);
        addCardsToPlayerHand(gameState.players[player].hand, gameState.centralPile);
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

    socket.on('tryCard', async ({card, origin, player, room}) => {
        const gameState = await getGameState(room);

        let container;
        if (origin === 'deck') {
            container = gameState.drawingPile;
        } else {
            container = gameState.players[player][origin];
        }

        const cardToPlay = container.splice(card, 1)[0];

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
            addCardsToPlayerHand(gameState.players[player].hand, gameState.centralPile);
            addCardsToPlayerHand(gameState.players[player].hand, [cardToPlay]);
            gameState.centralPile = [];
            updateOnCentralPile = [];
        }

        gameState.nextPlayer = getTheNextPlayer(gameState.nextPlayer, gameState.players, tryToKeepCurrent);

        const updateHandObject = {
            player: gameState.players[player].info.uid,
            hand: gameState.players[player]
        }

        broadcastIntoRoomWithEvent(socket, room, 'updateHand', updateHandObject);
        broadcastIntoRoomWithEvent(socket, room, 'updateCentralPile', updateOnCentralPile);
        broadcastIntoRoomWithEvent(socket, room, 'updateDrawingPile', gameState.drawingPile.length !== 0);
        broadcastIntoRoomWithEvent(socket, room, 'nextPlayer', gameState.nextPlayer.uid);

        handlePlayerFinish(socket, gameState, player);
        handleGameOver(socket, gameState, room);

        await updateGameState(room, gameState);
    });

    socket.on('sortHand', async ({room, player}) => {
        const gameState = await getGameState(room);

        const playerHand = gameState.players[player].hand;
        playerHand.sort(sortCards);

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

        lobbyData.data.isPublic = state;
        console.log("set:")
        console.log(state);

        broadcastIntoRoomWithEvent(socket, room, 'setSwitch', state);

        await updateLobby(room, lobbyData.data);
    });

    socket.on('getSwitchState', async ({room}) => {
        const lobbyData = await getLobbyById(room);

        console.log("get:")
        console.log(lobbyData.data.isPublic);
        broadcastIntoRoomWithEvent(socket, room, 'setSwitch', lobbyData.data.isPublic);
    });
});

const handlePlayerFinish = (socket, gameState, player) => {
    if (!isPlayerFinished(gameState.players[player])) return;

    gameState.players[player].stillPlaying = false;
    console.log('--');
    console.log(gameState.playersStillInMatch);
    gameState.playersStillInMatch--;
    console.log(gameState.playersStillInMatch);
    console.log('--');
    gameState.playersFinished++;
    gameState.players[player].finishedAs = gameState.playersFinished;
    socket.emit('finished');
}

const handleGameOver = (socket, gameState, room) => {
    if(!isGameOver(gameState.playersStillInMatch)) return;

    const playerPoints = calculatePoints(gameState);
    updateUsersPoints(playerPoints).then();
    broadcastIntoRoomWithEvent(socket, room, 'gameOver', playerPoints);
}

const calculatePoints = (gameState) => {
    const finishers = gameState.players.length;
    const playersPoints = []
    gameState.players.forEach((player) => {
        let points = 0;
        if (player.finishedAs) {
            points =  finishers - player.finishedAs;
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
    console.log(playersStillInMatch);
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
    cards.forEach(card => {
        if (card.rank !== 'JOKER') {
            hand.push(card)
        }
    })
}

const getTheNextPlayer = (current, players, tryToKeepCurrent) => {
    const numberOfPlayers = players.length;
    let index = (current.index + !tryToKeepCurrent) % numberOfPlayers;
    while (!players[index].stillPlaying) {
        index = (current.index + 1) % numberOfPlayers;
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

const buildGameState = (data) => {
    const numberOfDeck = calculateDecksNeeded(data.players.length);
    const dealer = new Dealer(data.players, numberOfDeck);
    const players = dealer.deal();

    const drawingPile = dealer.deck.cards.map(cardToObject);

    const playersStates = players.map((player) => {
        return {
            faceDown: player.faceDown.map(cardToObject),
            faceUp: player.faceUp.map(cardToObject),
            hand: player.hand.map(cardToObject),
            info: player.uid,
            stillPlaying: true
        };
    });

    return {
        players: playersStates,
        drawingPile: drawingPile,
        centralPile: [],
        playersStillInMatch: playersStates.length,
        playersFinished: 0
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

