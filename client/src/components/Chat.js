import React, {useEffect, useRef, useState} from 'react';

function Chat({socket, room}) {
    const [chat, setChat] = useState("");
    const chatWindow = useRef();
    const inputField = useRef();
    const joined = useRef(false);

    useEffect(() => {
        if (!socket) return;
        console.log(joined);
        if (joined.current) return;
        console.log("inside ${joined}")
        console.log(`Joining room ${room}...`);
        socket.emit('join', room);
        socket.on('receive', (data) => {
            console.log("Received message:", data.message);
            setChat((prevChat) => prevChat +  data.message + '\n');
        });
        joined.current = true;
    }, []);

    useEffect(() => {
        console.log("Chat changed:", chat);
        if (chatWindow.current) {
            chatWindow.current.value = chat;
        }
    }, [chat]);

    const send = () => {
        if (!socket) return;
        const message = inputField.current.value;
        if (!message) return;
        socket.emit('send', { message, room });
        inputField.current.value = '';
    }

    return (
        <>
            <style>{`input {color:black;}`}</style>
            <textarea ref={chatWindow} disabled={true} rows="4" cols="50"/>
            <br/>
            <input ref={inputField} type='text'/>
            <button onClick={send}>{"<-"}</button>
        </>
    );
}

export default Chat;
