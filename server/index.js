import 'dotenv/config';
import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import morgan from 'morgan';
import lobbyApi from './api/lobbyApi.js'
import {deletePlayerFromLobby, getHost, getLobbyById, setGameState, updateLobby} from './firebase/LobbiesDTO.js'
import Dealer from './util/dealer.js';
import {swapCards} from "./util/playerActions.js";

console.log(process.env.CLIENT_APP);

const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.CLIENT_APP } });

function broadcastIntoRoomWithEvent (socket, room, ev,  data) {
    socket.emit(ev, data);
    socket.to(room).emit(ev, data);
}

io.on('connection', (socket) => {
    const users = {};
    socket.uid = socket.handshake.query.uid;
    for (let [id, socket] of io.of("/").sockets) {
        users[id] = socket.uid;
    }
    console.log(users);

    console.log(socket.id);
    socket.on('join', (data) => {
        console.log(`Joined: ${data}`)
        socket.lobby = data;
        socket.join(data);
        socket.emit('joined');
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

    socket.on('disconnect', () => {
        deletePlayerFromLobby(socket.lobby, socket.uid)
            .then((returnValue) => {
                if (returnValue === -1) {
                    console.log(`${socket.lobby} host left`)
                    socket.to(socket.lobby).emit('host_disconnected');
                    broadcastIntoRoomWithEvent(socket, socket.lobby, 'host_disconnected', null);
                }
                console.log(`Socket disconnected with Google ID: ${socket.uid} from ${socket.lobby}`);
            })
            .catch(error => console.log(error.message))
    });

    socket.on('private', () => {
        console.log(users)
        console.log("send?");
        console.log(socket.rooms);
        console.log(users[0].userId);
        console.log(users[2].userId);
        socket.to(users[0].userID).emit('receive', {message:"privi", room:"idk"})
        socket.to(users[2].userID).emit('receive', {message:"privi", room:"idk"})
    });

    socket.on('gameStart', async ({room, config}) => {
        try {
            const data = await getLobbyById(room);
            console.log(data);
            const gameState = buildGameState(data, config);
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

    socket.on('ready', async ({room, uid}) => {
        const lobbyData = await getLobbyById(room);
        const update = {};
        if (lobbyData.data.playersNotReady === 1) {
            const firstPlayer = getFirstPlayer(lobbyData.data.gameState.players);
            update.gameState = lobbyData.data.gameState;
            update.gameState.nextPlayer = firstPlayer;
            broadcastIntoRoomWithEvent(socket, room, 'nextPlayer', firstPlayer);
        }

        update.playersNotReady = lobbyData.data.playersNotReady - 1;
        await updateLobby(room, update);
    });
});

const getFirstPlayer = (players) => {
    const hands = []
    for(let i = 0; i < players.length; i++) {
        const sorted = players[i].hand.sort(sortCards);
        hands.push({
            best: sorted[0].rank,
            second: sorted[1].rank,
            third: sorted[2].rank,
            player: i,
            uid: players[i].info.uid
        });
    }
    hands.sort(sortHands);
    return hands[0].uid;
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
    const cardValues = {'3': 0, '4': 1, '5': 2, '6': 3, '7': 4, '8': 5, '9': 6, 'J': 7, 'Q': 8, 'K': 9, 'A': 10, '2': 11, '10': 12, 'JOKER': 13};

    return cardValues[a.rank] < cardValues[b.rank] ? -1 : 1;
}

const cardToObject = (card) => {
    return {
        suit: card.suit,
        rank: card.rank
    };
};

const buildGameState = (data, config) => {
    const dealer = new Dealer(data.players, config.numberOfDeck);
    const players = dealer.deal();

    const drawingPile = dealer.deck.cards.map(cardToObject);

    const playersStates = players.map((player) => {
        return {
            faceDown: player.faceDown.map(cardToObject),
            faceUp: player.faceUp.map(cardToObject),
            hand: player.hand.map(cardToObject),
            info: player.uid
        };
    });

    return {
        players: playersStates,
        drawingPile: drawingPile,
        centralPile: []
    };
}

app.use(morgan('tiny'));

app.use(express.json());

app.use(lobbyApi);

server.listen(3001, () => {
    console.log('Server started on port 3001');
});

