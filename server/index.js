import 'dotenv/config';
import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import morgan from 'morgan';
import lobbyApi from './api/lobbyApi.js'
import {deletePlayerFromLobby, getHost, getLobbyById} from './firebase/LobbiesDTO.js'
import Dealer from './util/dealer.js';

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
        // socket.to(socket.lobby).emit('receive', {message:"privi", room:"idk"});
    });

    socket.on('gameStart', ({room, config}) => {
        getLobbyById(room)
            .then((data) => {
                const gameState = buildGameState(data, config);
                broadcastIntoRoomWithEvent(socket, room, 'starting...', null);
                broadcastIntoRoomWithEvent(socket, room, 'startingState', gameState);
            })
            .catch(error => console.log(error));
    });
});

const buildGameState = (data, config) => {
    console.log(data);
    console.log(config);
    const dealer = new Dealer(data.players, config.numberOfDeck);
    const players = dealer.deal();
    return {
        players: players,
        host: data.host,
        drawingPile: dealer.deck,
        centralPile: []
    };
}

app.use(morgan('tiny'));

app.use(express.json());

app.use(lobbyApi);

server.listen(3001, () => {
    console.log('Server started on port 3001');
});

