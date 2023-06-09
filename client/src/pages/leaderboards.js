import React, {useEffect, useState} from 'react';
import {authenticated} from "@/components/Authenticated";
import SortedList from "@/components/SortedList";
import {auth} from "@/firebase/fireBaseConfig";
import {useRouter} from "next/router";

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
            {users && <SortedList list={users}/>}
        </>
    );
}

export default authenticated(Leaderboards);
