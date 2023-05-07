const express = require('express');
const app = express();
const server = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(server, { cors: { origin: 'http://localhost:3000' } });

function broadcastIntoRoomWithEvent (socket, room, ev,  data) {
    socket.emit(ev, data);
    socket.to(room).emit(ev, data);
}

io.on('connection', (socket) => {
    console.log(socket.id);
    socket.on('join', (data) => {
        console.log(`Joined: ${data}`)
        socket.join(data);
    });

    socket.on('send', (data) => {
        console.log("sending: " + data.message)
        console.log("sending: " + data.roomId)
        broadcastIntoRoomWithEvent(socket, data.roomId, 'receive', data);
    });
});

server.listen(3001, () => {
    console.log('Server started on port 3001');
});
