import {broadcastIntoRoomWithEvent} from "../broadcastEvent.js";

export const onSend  = (data, socket) => {
    broadcastIntoRoomWithEvent(socket, data.room, 'receive', data);
}
