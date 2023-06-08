import {useEffect} from "react";
import {useRouter} from "next/router";

function PostGameWindow({stats}) {

    const router = useRouter();

    const populateWindow = () => {
        stats.sort((a, b) => {
            return a.points > b.points ? -1 : 1;
        });
        return (
            <ul>
                {
                    stats.map((stat) => {
                        return (
                            <li key={stat.uid}>{`${stat.name}: ${stat.points}`}</li>
                        )
                    })
                }
            </ul>
        );
    }

    const backToMain = () => {
        router.replace('/').then(() => null);
    }

    return (
        <div id="postGameContainer">
            <div id="postGameWindow">
                <div>
                    {populateWindow()}
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
