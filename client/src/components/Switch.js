import React, {useEffect, useRef} from 'react';

function Switch({socket, room, isHost}) {

    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        const toggle = document.getElementById("switch").children[0];

        socket.emit('getSwitchState', {room});

        socket.on('setSwitch', (state) => {
            console.log(state);
            toggle.checked = state;
        });

        if (!isHost) {
            toggle.disabled = true;
        }

        initialized.current = true;
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
