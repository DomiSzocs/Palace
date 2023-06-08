import React, {useEffect, useRef, useState} from 'react';

function Chat({socket, room}) {
    const [chat, setChat] = useState("");
    const chatWindow = useRef();
    const inputField = useRef();
    const joined = useRef(false);

    useEffect(() => {
        if (joined.current) return;
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

    const expandChatWindow = () => {
        chatWindow.current.rows = 10;
    }
    const resetChatWindow = () => {
        chatWindow.current.rows = 2;
    }

    return (
        <>
            <textarea ref={chatWindow} disabled={true} rows="2" cols="30" />
            <br/>
            <span onFocus={expandChatWindow} onBlur={resetChatWindow}>
                <input ref={inputField} type='text' />
            </span>
            <button onClick={send}>{"↵"}</button>
        </>
    );
}

export default Chat;
