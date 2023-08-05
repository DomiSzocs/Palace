import {firestore} from "./firebaseAdmin.js"
import LobbyAlreadyExistsError from "../errors/LobbyAlreadyExistsError.js";
import LobbyDoesNotExistError from "../errors/LobbyDoesNotExistError.js";
import LobbyAlreadyStartedError from "../errors/LobbyAlreadyStartedError.js";
import HostLeftError from "../errors/HostLeftError.js";
import AlreadyJoinedError from "../errors/AlreadyJoinedError.js";
import {deleteGameState} from "./gameStatesDAO.js";

export async function getAllPublicLobbies() {
    const lobbiesRef = firestore.collection('lobbies');
    const lobbiesData = await lobbiesRef.get();

    const returnValue = [];

    lobbiesData.forEach(lobby => {
        const lobbyData = lobby.data();

        if (!lobbyData.isPublic) return;

        if (lobbyData.started) return;

        returnValue.push({
            capacity: lobbyData.lobbySize,
            players: lobbyData.players.length,
            id: lobby.id,
            host: lobbyData.host,
        });
    });

    return returnValue;
}

export async function getLobbyById(room) {
    if (!room) return;

    const lobbyRef = firestore.collection('lobbies').doc(room);
    const lobbyData = await lobbyRef.get();

    if (!lobbyData.exists) return null;

    return lobbyData.data();
}

export async function getHost(room) {
    if (!room) return;

    const lobbyData = await getLobbyById(room);

    if (!lobbyData) return null;

    return lobbyData.host;
}

export async function createLobby(room, host) {
    if (!room) return;
    if (!host) return;

    const lobbyRef = firestore.collection('lobbies').doc(room);
    const lobbyData = await lobbyRef.get();

    if (lobbyData.exists) {
        throw new LobbyAlreadyExistsError(`Lobby '${room}' already exists`);
    }

    const data = {
        host: host.id,
        started: false,
        isPublic: false,
        lobbySize: 8,
        players: [],
    };

    await lobbyRef.set(data);
}

export async function updateLobby(room, updates) {
    if (!room) return;
    if (!updates) return;

    const lobbyRef = firestore.collection('lobbies').doc(room);
    const lobbyData = await lobbyRef.get();

    if (!lobbyData.exists) return;

    await lobbyRef.update(updates);
}

export async function deleteLobby(room) {
    if (!room) return;

    await firestore.collection('lobbies').doc(room).delete();
}

export async function addPlayerToLobby(room, player) {
    if (!room) return;
    if (!player) return;

    const lobbyData = await getLobbyById(room);

    if (!lobbyData) {
        throw new LobbyDoesNotExistError(`Lobby with id ${room} does not exist`);
    }

    if (lobbyData.started) {
        throw new LobbyAlreadyStartedError(`Lobby with id ${room} already started`);
    }

    const alreadyJoined = lobbyData.players.some((joinedPlayer) => joinedPlayer.uid === player.id)

    if (alreadyJoined) {
        throw new AlreadyJoinedError(`You already joined this lobby`)
    }

    lobbyData.players.push({
        name: player.name,
        uid: player.id
    });

    await updateLobby(room, lobbyData);
}

export async function deletePlayerFromLobby(room, uid) {
    if (!room) return;
    if (!uid) return;

    const lobbyData = await getLobbyById(room);

    if (!lobbyData) return;

    if (lobbyData.host === uid) {
        if (!lobbyData.started) {
            await deleteLobby(room);
            await deleteGameState(room);
            throw new HostLeftError('Host left')
        }
        lobbyData.host = null;
    }

    lobbyData.players = lobbyData.players.filter(player => player.uid !== uid);

    if (lobbyData === {}) {
        await deleteLobby(room);
        await deleteGameState(room);
        return;
    }

    await updateLobby(room, lobbyData);
}
