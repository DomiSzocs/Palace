export const broadcastIntoRoomWithEvent = (socket, room, ev,  data) => {
    socket.emit(ev, data);
    socket.to(room).emit(ev, data);
}
