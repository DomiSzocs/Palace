import {useEffect} from "react";
import {useRouter} from "next/router";
import SortedList from "@/components/SortedList";

function PostGameWindow({stats}) {

    const router = useRouter();

    const backToMain = () => {
        router.replace('/').then(() => null);
    }

    return (
        <div id="postGameContainer">
            <div id="postGameWindow">
                <div>
                    <SortedList list={stats}/>
                </div>
                <div>
                    <button>Back To Lobby</button>
                    <button onClick={backToMain}>Back Main Menu</button>
                </div>
            </div>
        </div>
    );
}

export default PostGameWindow;
