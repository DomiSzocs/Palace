import Link from "next/link";
import {authenticated} from "@/components/Authenticated";
import SignOut from "../components/SignOut"

function Home() {
    return (
        <div>
            <SignOut/>
            <Link href={'/host'}>Host a game</Link>
            <Link href={'/join'}>Join a game</Link>
            <Link href={'/find'}>Find a game</Link>
        </div>
    )
}

export default authenticated(Home);
