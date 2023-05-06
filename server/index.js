const express = require('express');
const app = express();
const server = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(server, { cors: { origin: 'http://localhost:3000' } });

// Allow requests from any domain and port

// Handle socket
io.on('connection', (socket) => {
    console.log(socket.id);
    socket.on('join', (data) => {
        console.log(`Joined: ${data}`)
        socket.join(data);
    });

    socket.on('send', (data) => {
        console.log("sending: " + data.message)
        console.log("sending: " + data.roomId)
        socket.emit('receive', data);
    });
});

// Start the server
server.listen(3001, () => {
    console.log('Server started on port 3001');
});
