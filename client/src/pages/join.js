import React, { useState } from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";
import {useRouter} from "next/router";

function Join() {
    const [room, setRoom] = useState('');
    const router = useRouter();
    const { error } = router.query;

    const onJoin = (e) => {
        e.preventDefault();
        router.replace(`/lobbies/${room}`).then();
    }

    return (
        <>
            <HomeLink/>
            <div id={"joinPanel"}>
                <h1 id="joinHint">Enter the room code</h1>
                <form onSubmit={onJoin}>
                    <input type='text' value={room} onChange={(e) => setRoom(e.target.value)}/>
                    <input type={"submit"} value={"Join"} onClick={onJoin}/>
                </form>
                {error && <div id="error">{error}</div>}
            </div>
        </>
    );
}

export default authenticated(Join);
