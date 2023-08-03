import React, {useRouter} from "next/router";
import SortedList from "@/components/SortedList";

function PostGameWindow({stats, isHost, socket, room}) {
    const router = useRouter();

    const backToMain = () => {
        router.replace('/').then(() => null);
    }

    const backToLobby = () => {
        socket.emit('restartLobby', room);
    }

    return (
        <div id="postGameContainer">
            <div id="postGameWindow">
                <div>
                    <SortedList list={stats}/>
                </div>
                <div>
                    <button onClick={backToMain}>Back To Main Menu</button>
                    {isHost && <button onClick={backToLobby}>Back To Lobby</button>}
                </div>
            </div>
        </div>
    );
}

export default PostGameWindow;
