import React, {useEffect, useRef, useState} from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";
import io from 'socket.io-client';
import Chat from "@/components/Chat";

function Lobby({room}) {
    const [socket, setSocket] = useState(null);
    const isSocketInitialized = useRef(false);

    useEffect(() => {
        if (isSocketInitialized.current) return;
        console.log("Initializing socket...");
        const localSocket = io('http://localhost:3001');
        console.log("Socket:", localSocket);
        setSocket(localSocket);
        isSocketInitialized.current = true;
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
