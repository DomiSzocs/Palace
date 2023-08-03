import {onDisconnect, onHostCheck, onJoin} from "./handlers/lobbyActions.js";
import {onSend} from "./handlers/chatActions.js";
import {onGameStart, onReady, onSwap} from "./handlers/preGameActions.js";
import {onPlayCards, onSortHand, onTakeCentralPile, onTryCard} from "./handlers/playerActions.js";
import {onGetVisibility, onSetVisibility} from "./visibilityActions.js";
import {broadcastIntoRoomWithEvent} from "./broadcastEvent.js";
import {getLobbyById, updateLobby} from "../firebase/lobbiesDAO.js";
import {deleteGameState} from "../firebase/gameStatesDAO.js";

export const initializeListeners = (socket) => {
    socket.on('join',({room}) => onJoin(room, socket));

    socket.on('disconnecting...', ({user, room}) => onDisconnect(user, room, socket));

    socket.on('amIHost', ({user, room}) => onHostCheck(user, room, socket))

    socket.on('send', (data) => onSend(data, socket));

    socket.on('gameStart', ({room}) => onGameStart(room, socket));

    socket.on('swap', (req) => onSwap(req, socket));

    socket.on('ready', (room) => onReady(room, socket));

    socket.on('playCards', ({room, player, cards, origin}) =>
        onPlayCards(room, player, cards, origin, socket));

    socket.on('tryCard', ({card, origin, player, room}) => onTryCard(room, player, card, origin, socket));

    socket.on('takeCentralPile', ({room, player}) => onTakeCentralPile(room, player, socket));

    socket.on('sortHand', ({room, player}) => onSortHand(room, player, socket));

    socket.on('setVisibility', async ({room, state}) => onSetVisibility(room, state, socket));

    socket.on('getSwitchState', async ({room}) => onGetVisibility(room, socket));

    socket.on('restartLobby', async (room) => {
        const lobbyData = await getLobbyById(room);

        lobbyData.started = false;
        await updateLobby(room, lobbyData);

        await deleteGameState(room);

        broadcastIntoRoomWithEvent(socket, room, 'newLobby', null);
        broadcastIntoRoomWithEvent(socket, room, 'playerList', lobbyData.players);
    });

    socket.on('getPlayers', async (room) => {
        const lobbyData = await getLobbyById(room);

        if (!lobbyData) return;

        socket.emit('playerList', lobbyData.players);
    })
}
