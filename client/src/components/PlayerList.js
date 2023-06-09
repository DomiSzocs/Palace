import React, {useEffect, useRef, useState} from 'react';

function PlayerList({socket}) {
    const [players, setPlayers] = useState([]);

    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        socket.on('joined', (players) => {
            console.log(players);
            setPlayers(players);
        });

        socket.on('playerLeft', (playerId) => {
            setPlayers((prevPlayers) =>
                prevPlayers.filter((player) => player.uid !== playerId)
            );
        });

        initialized.current = true;
    }, []);


    return (
        <div id="playerDiv">
            <ul>
                {
                    players.map(player => {
                        return (<li key={player.uid}>{player.name}</li>)
                    })
                }
            </ul>
        </div>
    );
}

export default PlayerList;
