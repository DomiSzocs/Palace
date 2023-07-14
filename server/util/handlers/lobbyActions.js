import {deletePlayerFromLobby, getHost, getLobbyById} from "../../firebase/lobbiesDAO.js";
import {deletePlayerFromGameState} from "../../firebase/gameStatesDAO.js";
import HostLeftError from "../../errors/HostLeftError.js";
import GameOverError from "../../errors/GameOverError.js";
import {broadcastIntoRoomWithEvent} from "../broadcastEvent.js";

export const onJoin = async (room, socket) => {
    socket.join(room);
    const lobbyData = await getLobbyById(room);
    broadcastIntoRoomWithEvent(socket, room, 'joined', lobbyData.players);
}

export const onHostCheck = async (user, room, socket) => {
    const host = await getHost(room);
    socket.emit('amIHostAnswer', host === user);
}

export const onDisconnect = async (user, room, socket) => {
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
}
