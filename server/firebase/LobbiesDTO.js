import {collection, doc, getDoc, getDocs, setDoc, deleteDoc} from 'firebase/firestore';
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
        host: host.id,
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
    const playerData = await getDoc(playerRef);

    if(playerData.exists()) {
        throw new Error('This player already joined!')
    }

    const newPlayerData = {
        name: player.name,
    };
    await setDoc(playerRef, newPlayerData);
    return  playerRef.id
}

export async function deletePlayerFromLobby(lobbyId, uid) {

    console.log("deleting....");
    console.log(uid)

    if (!lobbyId) return;
    if (!uid) return;

    const lobbyRef = doc(firestore,'lobbies', lobbyId);
    const lobbyData = await getDoc(lobbyRef);

    if (!lobbyData.exists()) {
        throw new Error(`Lobby with id ${lobbyId} does not exist`)
    }

    if (lobbyData.data().started) {
        throw new Error(`Lobby with id ${lobbyId} already started`)
    }

    if (lobbyData.data().host === uid) {
        console.log(`deleting lobby ${lobbyId}...`);
        const documents = await getDocs(collection(firestore, "lobbies", lobbyId, "players"));
        documents.forEach((document) => {
            deleteDoc(document.ref);
        });
        await deleteDoc(lobbyRef);
        return -1;
    }

    const playerRef = doc(firestore, "lobbies", lobbyId, "players", uid);
    await deleteDoc(playerRef)
    return 0;
}
