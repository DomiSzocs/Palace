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
    const [socket, setSocket] = useState(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isHost, setIsHost] = useState(null);
    const [endOfGameStats, setEndOfGameStats] = useState(null);
    const isSocketInitialized = useRef(false);
    const router = useRouter();

    useEffect(() => {
        console.log(`in lobby ${room}`);
        if (isSocketInitialized.current) return;
        const localSocket = io(process.env.NEXT_PUBLIC_GAME_SERVER, {
            query: { uid: auth.currentUser.uid }
        });
        setSocket(localSocket);
        isSocketInitialized.current = true;

        localSocket.emit('join', {user: auth.currentUser.uid, room});

        localSocket.emit('amIHost', {user: auth.currentUser.uid, room});

        localSocket.on('host_disconnected', () => {
            console.log("no host");
            router.replace('/').then(() => null);
        });

        localSocket.on('amIHostAnswer', (answer) => {
            console.log(answer);
            setIsHost(answer);
        });

        localSocket.on('starting...', () => {
            setIsGameStarted(true);
        });

        localSocket.on('gameOver', (points) => {
            setEndOfGameStats(points);
        });

        router.events.on('routeChangeStart', () => {
            const user = auth.currentUser.uid;
            localSocket.emit('disconnecting...', {user, room})
            localSocket.close();
            return true;
        });
    }, []);

    const emitGameStart = () => {
        if (!socket) return;
        socket.emit('gameStart', {room});
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
        if (!socket) return;

        return (
            <>
                <div className='chat'>
                    {socket && <Chat socket={socket} room={room}/>}
                </div>
            </>
        );
    };

    const GetGameWindow = () => {
        if (!socket) return;
        if (!isGameStarted) return;

        return <GameWindow socket={socket} room={room}/>;
    };

    const GetPostGameWindow = () => {
        if (!endOfGameStats) return;

        return <PostGameWindow stats={endOfGameStats}/>
    }
    return (
        <>
            <HomeLink/>
            {GetChat()}
            {GetGameWindow()}
            {GetStartButton()}
            {GetRoomElements()}
            {GetPostGameWindow()}
            {isHost != null && <Switch room={room} socket={socket} isHost={isHost}/>}
            {socket && <PlayerList socket={socket}/>}
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
