import React from 'react';
import Link from "next/link";

function HomeLink() {
    return (
        <Link id="homeLink" href={'/'} replace={true}>➜</Link>
    );
}

export default HomeLink;
