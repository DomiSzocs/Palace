import React, {useEffect, useState} from 'react';
import {authenticated} from "@/components/Authenticated";
import SortedList from "@/components/SortedList";
import {auth} from "@/firebase/fireBaseConfig";
import {useRouter} from "next/router";
import HomeLink from "@/components/HomeLink";

function Leaderboards() {

    const [users, setUsers] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchData().then();
    }, []);

    const fetchData = async () => {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + auth.currentUser.accessToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const users = await response.json();
            setUsers(users);
        } else {
            router.replace('/').then()
        }
    }

    return (
        <>
            <HomeLink/>
            <label id="leaderboardsLabel">Leaderboards</label>
            <div id="leaderBoard">
                {users && <SortedList list={users}/>}
            </div>

        </>
    );
}

export default authenticated(Leaderboards);
