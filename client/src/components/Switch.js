import React, {useEffect} from 'react';

function Switch({socket, room, isHost}) {
    useEffect(() => {
        const toggle = document.getElementById("switch").children[0];

        socket.emit('getSwitchState', {room});

        socket.on('setSwitch', (state) => {
            toggle.checked = state;
        });

        if (!isHost) {
            toggle.disabled = true;
        }

        return () => {
            socket.off('setSwitch');
        }

    }, []);

    const setVisibility = (element) => {
        socket.emit('setVisibility', {room: room, state: element.target.checked});
    }

    return (
        <div id="switch">
            <input onClick={setVisibility} type="checkbox"/>
            <label className="slider"></label>
            <label className="caption"></label>
        </div>
    );
}

export default Switch;
