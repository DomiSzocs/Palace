import React, { useState } from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";
import {useRouter} from "next/router";
import {auth} from "@/firebase/fireBaseConfig";

function Join() {

    const [room, setRoom] = useState('');
    const router = useRouter();

    const sendCode = async () => {
        const player = {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName
        }
        const response = await fetch('/api/join', {
            method: 'PUT',
            body: JSON.stringify({room, player}),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 204) {
            await router.push(`lobbies/${room}`);
        } else {
            return <p>Cannot join!</p>
        }
    }

    return (
        <>
            <HomeLink/>
            <div>
                <input type='text' value={room} onChange={(e) => setRoom(e.target.value)}/>
                <button onClick={sendCode}>Join</button>
            </div>
        </>
    );
}

export default authenticated(Join);
