import React, {useEffect, useRef} from 'react';
import {renderStartingState, reRenderHand} from "@/util/render";
import {auth} from "@/firebase/fireBaseConfig";
import Dealer from "@/util/dealer";
import {addListenersForSwapPhase, getSwapHandler, removeSwapPhaseEventListeners} from "@/util/eventListeners";

function GameWindow({socket, room}) {
    let inited = useRef(false);
    const chosenFromHand = useRef([]);
    const chosenFromFaceUp = useRef([]);
    const players = useRef({});
    const uid = useRef(auth.currentUser.uid)
    const swapHandler = useRef(getSwapHandler(chosenFromHand, chosenFromFaceUp))

    useEffect(() => {
        if (inited.current) return;
        socket.on('startingState', (state) => {
            renderStartingState(state, players);
            addListenersForSwapPhase(swapHandler.current);
            // const dealer = new Dealer(8, 3);
            // const playersStates = dealer.deal();
            // playersStates[0].uid = uid.current
            // renderStartingState({players:playersStates}, players);
            // addListenersForSwapPhase(swapHandler.current);
        });

        socket.on('updateHand', ({player, hand}) => {
            const playerNumber = players.current[player].localIndex;
            reRenderHand(playerNumber, hand);
        })

        socket.on('nextPlayer', (playerIndex) => {
            console.log(playerIndex);
        })
        inited.current = true;
    }, []);

    const swap = () => {
        if (!chosenFromHand.current.length) return;
        if (!chosenFromFaceUp.current.length) return;

        const req = {
            action: 'swap',
            serverIndex: players.current[uid.current].serverIndex,
            uid: uid.current,
            hand: chosenFromHand.current[0],
            faceUp: chosenFromFaceUp.current[0],
            room
        }
            // const hand = document.getElementById('localPlayerHand');
            // const faceUp = document.getElementById('0').children[1];
            // const handCards = [];
            // for (let i = 0; i < 3; i++) {
            //     handCards.push({rank: hand.children[i].dataset.value[0], suit: hand.children[i].dataset.value[2]});
            // }
            // const faceUpCards = [];
            // for (let i = 0; i < 3; i++) {
            //     faceUpCards.push({rank: faceUp.children[i].dataset.value[0], suit: faceUp.children[i].dataset.value[2]});
            // }
            // const temp = faceUpCards[chosenFromFaceUp.current[0]];
            // faceUpCards[chosenFromFaceUp.current[0]] = handCards[chosenFromHand.current[0]];
            // handCards[chosenFromHand.current[0]] = temp;
            // const faceDownCards = [{rank: 'A', suit: '♥'}, {rank: 'A', suit: '♥'}, {rank: 'A', suit: '♥'}];
            // const handasd = {
            //     faceUp: faceUpCards,
            //     faceDown: faceDownCards,
            //     hand: handCards
            // }
            //
            //reRenderHand(0, handasd);

        socket.emit('playerAction', req);
        chosenFromFaceUp.current = [];
        chosenFromHand.current = [];
    };

    const sendReady = () => {
        socket.emit('ready', {room, uid:uid.current});
        removeSwapPhaseEventListeners(swapHandler.current);
        document.getElementById("readyButton").style.display = 'none';
        document.getElementById("swapButton").style.display = 'none';

        // const nextPlayer = document.getElementById('2');
        // nextPlayer.classList.add('current');
    }

    return (
        <div id="container">
            <div id="centralPile"></div>
            <div id="drawPile"></div>
            <div id="discardPile"></div>
            <button id="swapButton" onClick={swap} >Swap</button>
            <button id="readyButton" onClick={sendReady}>Ready</button>
            <button id="playButton">Play Cards</button>
            <button id="sortButton">Sort Hand</button>
        </div>
    );
}

export default GameWindow;
