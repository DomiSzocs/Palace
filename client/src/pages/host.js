import React, {useEffect, useRef, useState} from 'react';
import HomeLink from "@/components/HomeLink";
import {authenticated} from "@/components/Authenticated";
import randomstring from "randomstring"
import io from 'socket.io-client';

function Host() {
    const [chat, setChat] = useState("");
    const [roomId, setRoomId] = useState("");
    const [socket, setSocket] = useState(null);
    const chatWindow = useRef();
    const inputField = useRef();

    const isSocketInitialized = useRef(false);
    useEffect(() => {
        if (isSocketInitialized.current) return;
        console.log("Initializing socket...");
        const localSocket = io('http://localhost:3001');
        console.log("Socket:", localSocket);
        setSocket(localSocket);
        isSocketInitialized.current = true;
    }, []);

    useEffect(() => {
        const code = randomstring.generate({
            length: 6,
            charset: 'alphanumeric',
            capitalization: 'uppercase'
        });
        setRoomId("ASDF");
    }, []);

    useEffect(() => {
        if (!socket) return;
        console.log(`Joining room ${roomId}...`);
        socket.emit('join', roomId);
    }, [roomId, isSocketInitialized]);

    useEffect(() => {
        console.log(socket);
        console.log("Setting up 'receive' event listener...");
        if (!socket) return;
        socket.on('receive', (data) => {
            console.log("Received message:", data.message);
            setChat((prevChat) => prevChat +  data.message + '\n');
        });
    }, [socket]);

    const f = () => {

    }

    useEffect(() => {
        console.log("Chat changed:", chat);
        if (chatWindow.current) {
            chatWindow.current.value = chat;
        }
    }, [chat]);

    f();

    const send = () => {
        if (!socket) return;
        const message = inputField.current.value;
        if (!message) return;
        socket.emit('send', { message, roomId });
        inputField.current.value = '';
    }

    return (
        <>
            <style>{`input {color:black;}`}</style>
            <HomeLink/>
            <div><h1>Hostin...</h1></div>
            <div className='chat'>
                <textarea ref={chatWindow} disabled={true} rows="4" cols="50"/>
                <br/>
                <input ref={inputField} type='text'/>
                <button onClick={send}>{"<-"}</button>
            </div>
            <h1>{roomId}</h1>
        </>
    );
}

export default authenticated(Host);
