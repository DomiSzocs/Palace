import React, {useEffect, useRef, useState} from 'react';
import {auth} from "@/firebase/fireBaseConfig";

function Chat({socket, room}) {
    const [chat, setChat] = useState("");
    const chatWindow = useRef();
    const inputField = useRef();
    const playerName = useRef(auth.currentUser.displayName);

    useEffect(() => {
        socket.on('receive', (data) => {
            setChat((prevChat) => prevChat + data.message);
        });

        return () => {
            socket.off('receive');
        }
    }, []);

    useEffect(() => {
        if (chatWindow.current) {
            chatWindow.current.value = chat;
        }
    }, [chat]);

    const send = (e) => {
        e.preventDefault()

        if (!socket) return;
        const message = inputField.current.value;
        if (!message) return;

        const chatEntry = `${playerName.current}: ${message}\n`;

        socket.emit('send', { message: chatEntry, room });
        inputField.current.value = '';
        scrollDown();
    }

    const expandChatWindow = () => {
        chatWindow.current.rows = 10;
    }
    const resetChatWindow = () => {
        chatWindow.current.rows = 2;
        scrollDown()
    }

    const scrollDown = () => {
        chatWindow.current.scrollTop = chatWindow.current.scrollHeight;
    }

    return (
        <>
            <textarea ref={chatWindow} disabled={true} rows="2" cols="30" />
            <br/>
            <form onSubmit={send}>
                <span onFocus={expandChatWindow} onBlur={resetChatWindow}>
                 <input ref={inputField} type='text' />
                </span>
                <input type="submit" value={"↵"} onClick={send}/>
            </form>
        </>
    );
}

export default Chat;
