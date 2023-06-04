import React, {useEffect, useRef} from 'react';
import {renderPlayerInfo, renderStartingState, reRenderHand, updateCurrent} from "@/util/render";
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
            renderPlayerInfo(state.players, players);
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

        socket.on('nextPlayer', (playerId) => {
            updateCurrent(players.current[playerId].localIndex);

            // if (playerId === uid.current) {
            //     addRoundEventListener()
            // }
        })

        inited.current = true;
    }, []);


    // const addRoundEventListener = () => {
    //     addListenerToDrawingPile();
    //
    //     if (addListenerToHandPile()) return;
    //
    //     if (addListenerToFaceUpPile()) return;
    //
    //     addListenerToFaceDownPile();
        // const drawingPile = document.getElementById('drawPile')
        // if (drawingPile.children.length) {
        //     drawingPile.children[0].addEventListener('click', handler)

        // }

        // const localPlayerHand = document.getElementById('localPlayerHand');
        //
        // if (localPlayerHand.children.length) {
        //     Array.from(localPlayerHand.children).forEach((card) => {
        //         card.addEventListener('click', handler);
        //     })
        //     return;
        // }

        // const faceUp = document.getElementById('0').children[1];
        // if (faceUp.children.length) {
        //     Array.from(faceUp.children).forEach((card) => {
        //         card.addEventListener('click', handler);
        //     })
        //     return;
        // }

        // const faceDown = document.getElementById('0').children[0];
        // Array.from(faceDown.children).forEach((card) => {
        //     card.addEventListener('click', handler);
        // })
    // }

    // const addListenerToDrawingPile = () => {
    //     const drawingPile = document.getElementById('drawPile')
    //     if (drawingPile.children.length) {
    //         drawingPile.children[0].addEventListener('click', handler)
    //     }
    //
    //     return drawingPile.children.length !== 0;
    //  }
    //
    // const addListenerToHandPile = () => {
    //     const localPlayerHand = document.getElementById('localPlayerHand');
    //     Array.from(localPlayerHand.children).forEach((card) => {
    //         card.addEventListener('click', handler);
    //     })
    //
    //     return localPlayerHand.children.length !== 0;
    // }
    //
    // const addListenerToFaceUpPile = () => {
    //     const faceUp = document.getElementById('0').children[1];
    //     Array.from(faceUp.children).forEach((card) => {
    //         card.addEventListener('click', handler);
    //     })
    //     return faceUp.children.length !== 0;
    // }
    //
    // const addListenerToFaceDownPile = () => {
    //     const faceDown = document.getElementById('0').children[0];
    //     Array.from(faceDown.children).forEach((card) => {
    //         card.addEventListener('click', handler);
    //     })
    //
    //     return faceDown.children.length !== 0;
    // }

    const handler = (element) => {
        console.log(element.target);
    }
    // export const renderPlayerInfo = (state, players) => {
    //     console.log(players);
    //     console.log(players.current);
    //     state.forEach((player) => {
    //         const hand = document.getElementById(players.current[player.info.uid].localIndex);
    //         const nameTag = document.createElement('div');
    //         nameTag.classList.add('nameTag');
    //         nameTag.innerText = player.info.name;
    //         hand.appendChild(nameTag);
    //     })
    // };

    // const updateCurrent = (playerIndex) => {
    //     deleteLastCurrent();
    //     setCurrent(playerIndex)
    // };
    //
    // const deleteLastCurrent = () => {
    //     const currents = document.getElementsByClassName('current');
    //     Array.from(currents).forEach(div => div.classList.remove('current'));
    // };
    //
    // const setCurrent = (playerIndex) => {
    //     const currentPlayer = document.getElementById(playerIndex);
    //     currentPlayer.classList.add('current');
    // };

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
        };
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
