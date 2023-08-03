import React, {useEffect, useState} from 'react';

function PlayerList({socket, room}) {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        socket.emit('getPlayers', room);

        socket.on('playerList', (players) => {
            console.log(players);
            setPlayers(players);
        });

        socket.on('playerLeft', (playerId) => {
            setPlayers((prevPlayers) =>
                prevPlayers.filter((player) => player.uid !== playerId)
            );
        });

        return () => {
            socket.off('joined');
            socket.off('playerLeft')
        }
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
