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
                    <button onClick={backToMain}>Back To Main Menu</button>
                </div>
            </div>
        </div>
    );
}

export default PostGameWindow;
