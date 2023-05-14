import React from 'react';
import Link from "next/link";
import {useRouter} from "next/router";

function HomeLink() {
    const router = useRouter();

    return (
        <Link href={'/'} replace={true}>Back home page</Link>
    );
}

export default HomeLink;
