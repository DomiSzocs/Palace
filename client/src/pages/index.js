import Link from "next/link";
import {authenticated} from "@/components/Authenticated";
import SignOut from "../components/SignOut"
import randomstring from "randomstring";
import {useRouter} from "next/router";

function Home() {
    const router = useRouter();

    const createLobby = () => {
        const room = randomstring.generate({
            length: 6,
            charset: 'alphanumeric',
            capitalization: 'uppercase'
        });
        router.push(`/lobbies/${room}`).then(() => null);
    }

    return (
        <div>
            <SignOut/>
            <Link onClick={createLobby} href={''}>Host a game</Link>
            <Link href={'/join'}>Join a game</Link>
            <Link href={'/find'}>Find a game</Link>
        </div>
    )
}

export default authenticated(Home);
