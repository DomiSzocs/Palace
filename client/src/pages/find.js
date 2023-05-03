import React from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";

function Find() {
    return (
        <>
            <HomeLink/>
            <div><h2> Findin... </h2></div>
        </>
);
}

export default authenticated(Find);
