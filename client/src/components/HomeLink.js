import React from 'react';
import Link from "next/link";
import {useRouter} from "next/router";

function HomeLink() {
    const router = useRouter();

    return (
        <Link id="homeLink" href={'/'} replace={true}>➜</Link>
    );
}

export default HomeLink;
