import React, {useEffect, useRef, useState} from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";
import io from 'socket.io-client';
import Chat from "@/components/Chat";
import {auth} from "@/firebase/fireBaseConfig";
import {useRouter} from "next/router";
import GameWindow from "@/components/GameWindow";

function Lobby({room}) {
    const [socket, setSocket] = useState(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const isSocketInitialized = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (isSocketInitialized.current) return;
        const localSocket = io(process.env.NEXT_PUBLIC_GAME_SERVER, {
            query: { uid: auth.currentUser.uid }
        });
        setSocket(localSocket);
        isSocketInitialized.current = true;

        localSocket.emit('join', room);

        localSocket.emit('amIHost', {user:auth.currentUser.uid, room});

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

        router.events.on('routeChangeStart', () => {
            localSocket.close();
            return true;
        });
    }, []);

    const emitGameStart = () => {
        if (!socket) return;
        const config = {
            numberOfDeck: 1,
            numberOfRounds: 3,
            specialCards: {
                2:true,
                10:true,
                'JOKER': true
            }
        };
        socket.emit('gameStart', {room, config});
    };

    const copyRoom = ({target}) => {
        navigator.clipboard.writeText(target.innerText);
        target.nextSibling.style.display = 'inline-block';
    }

    const GetRoomElements = () => {
        if (isGameStarted) return;

        return (
            <div>
                <h1 onClick={copyRoom}>{room}</h1>
                <p id='copyMessage'>Copied!</p>
            </div>
        );
    };

    const GetStartButton = () => {
        if (isGameStarted) return;
        if (!isHost) return;

        return <button onClick={emitGameStart}> Start The Game</button>;
    };

    const GetChat = () => {
        if (!socket) return;

        return (
            <div className='chat'>
                {socket && <Chat socket={socket} room={room}/>}
            </div>
        );
    };

    const GetGameWindow = () => {
        if (!socket) return;
        if (!isGameStarted) return;

        return <GameWindow socket={socket} room={room} isHost={isHost}/>;
    };

    return (
        <>
            <HomeLink/>
            {GetChat()}
            {GetGameWindow()}
            {GetStartButton()}
            {GetRoomElements()}
        </>
    );
}

export default authenticated(Lobby);

export async function getServerSideProps(context) {
    const {params} = context;
    const {room} = params;
    return {
        props: {
            room
        }
    }
}
