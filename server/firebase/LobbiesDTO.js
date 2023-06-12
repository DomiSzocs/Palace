import {collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc} from 'firebase/firestore';
import {firestore} from "./fireBaseConfig.js";

export async function getAllPublicLobbies() {
    const lobbiesRef = collection(firestore, 'lobbies');
    const lobbiesData = await getDocs(lobbiesRef);

    const returnValue = [];

    console.log(lobbiesData.docs.length)

    for (const doc of lobbiesData.docs) {
        if (!doc.data().isPublic) continue;
        if (doc.data().started) continue;

        const playersRef = collection(firestore, 'lobbies', doc.id, 'players');
        const playersData = await getDocs(playersRef);

        let host = null;

        playersData.forEach(document => {
            if (document.id === doc.data().host) {
                host = document.data().name;
            }
        });

        returnValue.push({
            capacity: doc.data().lobbySize,
            players: playersData.docs.length,
            id: doc.id,
            host: host
        });
    }

    console.log('returning...');
    return returnValue;
}

export async function getLobbyById(lobbyId) {
    const lobbyRef = doc(firestore, 'lobbies', lobbyId);
    const lobbyData = await getDoc(lobbyRef);

    const answer = {};
    if (lobbyData.exists()) {
        answer.data = lobbyData.data();
    } else {
        return null;
    }

    answer.players = [];
    const playersRef = collection(firestore, 'lobbies', lobbyId, 'players');
    const playersData = await getDocs(playersRef);
    playersData.forEach((document) => {
        answer.players.push({uid: document.id, name: document.data().name});
    });

    return answer;
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
        started: false,
        isPublic: false,
        lobbySize: 8
    };

    await setDoc(lobbyRef, data);
    // await setDoc(doc(playersRef, host.id), {name: host.name});
}

export async function addPlayerToLobby(lobbyId, player) {
    const lobbyRef = doc(firestore,'lobbies', lobbyId);
    const lobbyData = await getDoc(lobbyRef);

    if (!lobbyData.exists()) {
        throw new Error(`Lobby with id ${lobbyId} does not exist`)
    }

    if (lobbyData.data().started) {
        throw new Error(`Lobby with id ${lobbyId} already started`);
    }

    const playerRef = doc(firestore, "lobbies", lobbyId, "players", player.id);
    const playerData = await getDoc(playerRef);

    if (playerData.exists()) {
        throw new Error(`You already joined this lobby`);
    }

    const newPlayerData = {
        name: player.name,
    };
    await setDoc(playerRef, newPlayerData);
    return  playerRef.id
}

export async function deletePlayerFromLobby(lobbyId, uid) {
    if (!lobbyId) return;
    if (!uid) return;

    const lobbyRef = doc(firestore,'lobbies', lobbyId);
    const lobbyData = await getDoc(lobbyRef);

    if (!lobbyData.exists()) {
        throw new Error(`Lobby with id ${lobbyId} does not exist`)
    }

    const gameState = lobbyData.data().gameState;
    console.log(lobbyData.data());
    console.log(lobbyData.data().gameState);
    if (gameState) {
        let i = 0;
        while (gameState.players[i].info.uid !== uid) {
            i++;
        }
        console.log(gameState.players[i].stillPlaying);
        if (gameState.players[i].stillPlaying) {
            gameState.players.splice(i, 1);
            gameState.playersStillInMatch--;
            gameState.playersFinished++;
            await updateGameState(lobbyId, gameState)
        }
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
    await deleteDoc(playerRef);

    if (gameState && gameState.playersStillInMatch <= 1) {
        return 1;
    }

    return 0;
}

export async function getHost(room) {
    const lobbyRef = doc(firestore, 'lobbies', room);
    const lobbyData = await getDoc(lobbyRef);

    if (lobbyData.exists()) {
        return lobbyData.data().host;
    } else {
        return null;
    }
}

export async function updateLobby(room, update) {
    const lobbyRef = doc(firestore, 'lobbies', room);
    const lobbyData = await getDoc(lobbyRef);

    if (!lobbyData.exists()) {
        return null;
    }

    await updateDoc(lobbyRef, update);
}

export async function setGameState(room, gameState, started) {
    const lobbyRef = doc(firestore, 'lobbies', room);
    const playersNotReady = gameState.players.length;
    await updateDoc(lobbyRef, {playersNotReady: playersNotReady, started: started, gameState: gameState});
}

export async function updateGameState(room, gameState) {
    const lobbyRef = doc(firestore, 'lobbies', room);
    await updateDoc(lobbyRef, {gameState: gameState});
}

export async function getGameState(room) {
    const lobbyRef = doc(firestore, 'lobbies', room);
    const lobbyData = await getDoc(lobbyRef);

    if (!lobbyData.exists()) {
        return null;
    }

    return lobbyData.data().gameState;
}
