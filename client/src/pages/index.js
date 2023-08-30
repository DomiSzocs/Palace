import Link from "next/link";
import {authenticated} from "@/components/Authenticated";
import SignOut from "../components/SignOut"
import {useRouter} from "next/router";
import {auth} from "@/firebase/fireBaseConfig";

function Home() {
    const router = useRouter();

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
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.currentUser.accessToken
            }
        });

        const room = await response.json();
        await router.push(`/lobbies/${room}`);
    }

    return (
        <div id="mainMenu">
            <SignOut/>
            <h1 id="title">Palace</h1>
            <div id="navigation">
                <Link onClick={createLobby} href={''}>Host A Game</Link>
                <Link href={'/join'}>Join A Game</Link>
                <Link href={'/find'}>Find A Game</Link>
                <Link href={'/leaderboard'}>Leaderboard</Link>
            </div>
        </div>
    )
}

export default authenticated(Home);
