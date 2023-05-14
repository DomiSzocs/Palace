import React, {useEffect, useRef, useState} from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";
import io from 'socket.io-client';
import Chat from "@/components/Chat";
import {auth} from "@/firebase/fireBaseConfig";
import {useRouter} from "next/router";


function Lobby({room}) {
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

        localSocket.on('host_disconnected', () => {
            console.log("no host");
            router.replace('/').then(() => null);
        });

        router.events.on('routeChangeStart', ({ url, as, options }) => {
            console.log("left page?");
            localSocket.close();
            return true;
        });
    }, []);
    
    return (
        <>
            <HomeLink/>
            <div className='chat'>
                {socket && <Chat socket={socket} room={room}/>}
            </div>
            <h1>{room}</h1>
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
