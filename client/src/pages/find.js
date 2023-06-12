import React, {useEffect, useState} from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";
import {useRouter} from "next/router";
import {auth} from "@/firebase/fireBaseConfig";

function Find() {
    const [lobbies, setLobbies] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchData().then();
    }, []);

    const fetchData = async () => {
        const response = await fetch('http://localhost:3000/api/lobbies', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + auth.currentUser.accessToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const {lobbies} = await response.json();
            setLobbies(lobbies);
        } else {
            router.replace('/').then()
        }
    }

    const joinLobby = (e) => {
        router.replace(`/lobbies/${e.target.parentElement.id}`).then();
    }

    return (
        <>
            <HomeLink/>
            <div id="lobbyContainer">
                {!lobbies.length && <p>No public lobbies available</p>}
                <table>
                    {
                        lobbies.map(lobby => {
                            return (
                                <tr key={lobby.id} id={lobby.id} onMouseDown={joinLobby}>
                                    <td>{lobby.id}</td>
                                    <td>{`Host: ${lobby.host}`}</td>
                                    <td>{`Players: ${lobby.players} / ${lobby.capacity}`}</td>
                                </tr>
                            );
                        })
                    }
                </table>
            </div>
        </>
    );
}

export default authenticated(Find);
