import React, { useState } from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";

function Join() {

    const [code, setCode] = useState('');

    const sendCode = async () => {
        const response = await fetch('/api/join', {
            method: 'POST',
            body: JSON.stringify({code}),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log(data);
    }

    return (
        <>
            <HomeLink/>
            <div>
                <input type='text' value={code} onChange={(e) => setCode(e.target.value)}/>
                <button onClick={sendCode}>Join</button>
            </div>
        </>
    );
}

export default authenticated(Join);
