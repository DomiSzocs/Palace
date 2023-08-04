import React, {useEffect, useRef, useState} from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";
import io from 'socket.io-client';
import Chat from "@/components/Chat";
import {auth} from "@/firebase/fireBaseConfig";
import {useRouter} from "next/router";
import GameWindow from "@/components/GameWindow";
import PostGameWindow from "@/components/PostGameWindow";
import restricted from "@/components/Restricted";
import Switch from "@/components/Switch";
import PlayerList from "@/components/PlayerList";

function Lobby({room}) {
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isHost, setIsHost] = useState(null);
    const [endOfGameStats, setEndOfGameStats] = useState(null);
    const socket = useRef(null);
    const router = useRouter();

    useEffect(() => {
        socket.current = io(process.env.NEXT_PUBLIC_GAME_SERVER, {
            query: { uid: auth.currentUser.uid }
        });

        socket.current.emit('join', {user: auth.currentUser.uid, room});

        socket.current.emit('amIHost', {user: auth.currentUser.uid, room});

        socket.current.on('host_disconnected', () => {
            router.replace('/').then(() => null);
        });

        socket.current.on('amIHostAnswer', (answer) => {
            setIsHost(answer);
        });

        socket.current.on('starting...', () => {
            setIsGameStarted(true);
        });

        socket.current.on('gameOver', (points) => {
            setEndOfGameStats(points);
        });

        socket.current.on('newLobby', () => {
            setIsGameStarted(false);
            setEndOfGameStats(null);
        })

        return () => {
            socket.current.off('host_disconnected');
            socket.current.off('amIHostAnswer');
            socket.current.off('starting...');
            socket.current.off('gameOver');
            socket.current.off('newLobby');

            const user = auth.currentUser.uid;
            socket.current.emit('disconnecting...', {user, room})
            socket.current.disconnect();
            socket.current = null;
        }

    }, []);

    const emitGameStart = () => {
        if (!socket.current) return;
        socket.current.emit('gameStart', {room});
    };

    const copyRoom = ({target}) => {
        navigator.clipboard.writeText(target.innerText);
        target.nextSibling.style.display = 'inline';
    }

    const GetRoomElements = () => {
        if (isGameStarted) return;

        return (
            <div className="roomId">
                <div onClick={copyRoom}>{room}</div>
                <div id="copyMessage">Copied!</div>
            </div>
        );
    };

    const GetStartButton = () => {
        if (isGameStarted) return;
        if (!isHost) return;

        return <button id="startTheGameButton" onClick={emitGameStart}> Start The Game</button>;
    };

    const GetChat = () => {
        if (!socket.current) return;

        return (
            <>
                <div className='chat'>
                    <Chat socket={socket.current} room={room}/>
                </div>
            </>
        );
    };

    const GetGameWindow = () => {
        if (!socket.current) return;
        if (!isGameStarted) return;

        return <GameWindow socket={socket.current} room={room}/>;
    };

    const GetPostGameWindow = () => {
        if (!endOfGameStats) return;
        if (!isGameStarted) return;

        return <PostGameWindow stats={endOfGameStats} isHost={isHost} socket={socket.current} room={room}/>
    }

    const GetSwitch = () => {
        if (!socket.current) return;
        if (isGameStarted) return;
        if (isHost === null) return;

        return <Switch room={room} socket={socket.current} isHost={isHost}/>
    }

    const GetPlayerList = () => {
        if (!socket.current) return;
        if (isGameStarted) return;
        return <PlayerList socket={socket.current} room={room}/>
    }

    return (
        <>
            <HomeLink/>
            {GetChat()}
            {GetGameWindow()}
            {GetStartButton()}
            {GetRoomElements()}
            {GetPostGameWindow()}
            {GetSwitch()}
            {GetPlayerList()}
        </>
    );
}

export default authenticated(restricted(Lobby));

export async function getServerSideProps(context) {
    const {params} = context;
    const {room} = params;
    return {
        props: {
            room
        }
    }
}
