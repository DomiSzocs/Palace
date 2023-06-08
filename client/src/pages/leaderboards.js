import React from 'react';
import {authenticated} from "@/components/Authenticated";
import SortedList from "@/components/SortedList";

function Leaderboards({users}) {
    return (
        <SortedList list={users}/>
    );
}

export const getServerSideProps = async () => {
    const response = await fetch('http://localhost:3000/api/users');

    let users;
    if (response.status === 200) {
        users = await response.json();
        console.log(users);
    } else {
        users = [];
    }

    return { props: { users } };
};

export default authenticated(Leaderboards);
