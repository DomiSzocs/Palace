import {collection, doc, getDoc, setDoc} from 'firebase/firestore';
import {firestore} from "./fireBaseConfig.js";

export async function getLobbyById(lobbyId) {
    const lobbyRef = doc(firestore, 'lobbies', lobbyId);
    const lobbyData = await getDoc(lobbyRef);

    if (lobbyData.exists()) {
        return lobbyData.data();
    } else {
        return null;
    }
}

export async function createLobby(room, host) {
    const lobbyRef = doc(firestore, 'lobbies', room);

    const lobbyDoc = await getDoc(lobbyRef);
    if (lobbyDoc.exists()) {
        throw new Error(`Lobby '${room}' already exists`);
    }

    const playersRef = collection(lobbyRef, 'players');
    const data = {
        host: host.name,
        started: false
    };

    console.log(data);
    console.log(host);

    await setDoc(lobbyRef, data);
    await setDoc(doc(playersRef, host.id), {name: host.name});
}

export async function addPlayerToLobby(lobbyId, player) {
    const lobbyRef = doc(firestore,'lobbies', lobbyId);
    const lobbyData = await getDoc(lobbyRef);

    if (!lobbyData.exists()) {
        throw new Error(`Lobby with id ${lobbyId} does not exist`)
    }

    if (lobbyData.data().started) {
        throw new Error(`Lobby with id ${lobbyId} already started`)
    }

    const playerRef = doc(firestore, "lobbies", lobbyId, "players", player.id);
    const playerData = {
        name: player.name,
    };
    await setDoc(playerRef, playerData);
    return  playerRef.id
}
