import Link from "next/link";
import {authenticated} from "@/components/Authenticated";
import SignOut from "../components/SignOut"
import {useRouter} from "next/router";
import {auth} from "@/firebase/fireBaseConfig";

function Home() {
    const router = useRouter();

    console.log(auth)

    const createLobby = async () => {
        const host = {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName
        }

        const response = await fetch('/api/host', {
            method: 'POST',
            body: JSON.stringify({
                host: host
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const room = await response.json();
        await router.push(`/lobbies/${room}`);
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
