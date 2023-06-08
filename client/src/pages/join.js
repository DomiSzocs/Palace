import React, { useState } from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";
import {useRouter} from "next/router";
import Link from "next/link";

function Join() {
    const [room, setRoom] = useState('');
    const router = useRouter();
    const { error } = router.query;

    return (
        <>
            <HomeLink/>
            <div>
                <input type='text' value={room} onChange={(e) => setRoom(e.target.value)}/>
                <Link href={`/lobbies/${room}`}>Join</Link>
                {error && <div>{error}</div>}
            </div>
        </>
    );
}

export default authenticated(Join);
