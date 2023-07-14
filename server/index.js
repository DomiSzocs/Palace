import 'dotenv/config';
import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import morgan from 'morgan';
import lobbyApi from './api/lobbyApi.js'
import userApi from "./api/userApi.js";
import {verifyToken} from "./middlewares/authMiddleWare.js";
import {initializeListeners} from "./util/initializeListeners.js";

const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.CLIENT_APP } });

io.on('connection', initializeListeners);

app.use(morgan('tiny'));

app.use(express.json());

app.use(verifyToken);

app.use(lobbyApi);

app.use(userApi);

server.listen(3001, () => {
    console.log('Server started on port 3001');
});
