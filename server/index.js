import 'dotenv/config';
import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import morgan from 'morgan';
import lobbyApi from './api/lobbyApi.js'
import {deletePlayerFromLobby} from './firebase/LobbiesDTO.js'

console.log(process.env.CLIENT_APP);

const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.CLIENT_APP } });

function broadcastIntoRoomWithEvent (socket, room, ev,  data) {
    socket.emit(ev, data);
    socket.to(room).emit(ev, data);
}

io.on('connection', (socket) => {
    const uid = socket.handshake.query.uid;
    let lobby = null;
    console.log(socket.id);
    socket.on('join', (data) => {
        console.log(`Joined: ${data}`)
        lobby = data;
        socket.join(data);
    });

    socket.on('send', (data) => {
        console.log("sending: " + data.message)
        console.log("sending: " + data.room)
        broadcastIntoRoomWithEvent(socket, data.room, 'receive', data);
    });

    socket.on('disconnect', () => {
        deletePlayerFromLobby(lobby, uid)
            .then((returnValue) => {
                if (returnValue === -1) {
                    console.log(`${lobby} host left`)
                    socket.to(lobby).emit('host_disconnected');
                    broadcastIntoRoomWithEvent(socket, lobby, 'host_disconnected', null);
                }
                console.log(`Socket disconnected with Google ID: ${uid} from ${lobby}`);
            })
            .catch(err => console.log("err"))
    })
});

app.use(morgan('tiny'));

app.use(express.json());

app.get('/api/lobbies/:room', lobbyApi);

app.put('/api/lobbies/:room', lobbyApi);

app.post('/api/lobbies', lobbyApi);

server.listen(3001, () => {
    console.log('Server started on port 3001');
});

