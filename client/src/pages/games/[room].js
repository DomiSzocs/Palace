import React, {useEffect, useRef, useState} from 'react';
import {authenticated} from "@/components/Authenticated";
import dynamic from "next/dynamic";
import Chat from "@/components/Chat";
import {useRouter} from "next/router";
import io from "socket.io-client";
import {auth} from "@/firebase/fireBaseConfig";

const GameWindow = dynamic(
    () => import('../../components/GameWindow'),
    { ssr: false }
)

function Game(props) {

    const [socket, setSocket] = useState(null);
    const isSocketInitialized = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (isSocketInitialized.current) return;
        console.log("Initializing socket...");
        console.log(process.env);
        const localSocket = io(process.env.NEXT_PUBLIC_GAME_SERVER, {
            query: { uid: auth.currentUser.uid }
        });
        console.log("Socket:", localSocket);
        setSocket(localSocket);
        isSocketInitialized.current = true;

        router.events.on('routeChangeStart', ({ url, as, options }) => {
            console.log("left page?");
            localSocket.close();
            return true;
        });
    }, []);

    return(
        <div>
            <GameWindow/>
            <div className='chat'>
                {socket && <Chat socket={socket} room={'123123'}/>}
            </div>
        </div>

    );
}

export default authenticated(Game);
