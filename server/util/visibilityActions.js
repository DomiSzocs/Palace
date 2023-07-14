import {getLobbyById, updateLobby} from "../firebase/lobbiesDAO.js";
import {broadcastIntoRoomWithEvent} from "./broadcastEvent.js";

export const onSetVisibility = async (room, state, socket) => {
    const lobbyData = await getLobbyById(room);

    if (!lobbyData) return;

    lobbyData.isPublic = state;

    broadcastIntoRoomWithEvent(socket, room, 'setSwitch', state);

    await updateLobby(room, lobbyData);
}

export const onGetVisibility = async (room, socket) => {
    const lobbyData = await getLobbyById(room);

    if (!lobbyData) return;

    broadcastIntoRoomWithEvent(socket, room, 'setSwitch', lobbyData.isPublic);
}
