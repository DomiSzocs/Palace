import React from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";

function Host() {
    return (
        <>
            <HomeLink/>
            <div><h1>Hostin...</h1></div>
        </>
    );
}

export default authenticated(Host);
