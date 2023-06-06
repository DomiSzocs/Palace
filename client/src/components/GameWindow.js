import React, {useEffect, useRef} from 'react';
import {
    renderPlayerInfo,
    renderStartingState,
    reRenderHand,
    updateCentralPile,
    updateCurrent, setDrawingPile
} from "@/util/render";
import {auth} from "@/firebase/fireBaseConfig";
import {
    addListenersForSwapPhase, getRoundHandlers,
    getSwapHandler, removeHandler,
    removeSwapPhaseEventListeners, setRoundEventListeners, useHandler
} from "@/util/eventListeners";
import {removeMarks} from "@/util/userInteractions";

function GameWindow({socket, room, isHost}) {
    let inited = useRef(false);
    const chosenFromHand = useRef([]);
    const chosenFromFaceUp = useRef([]);
    const players = useRef({});
    const uid = useRef(auth.currentUser.uid)
    const swapHandler = useRef(getSwapHandler(chosenFromHand, chosenFromFaceUp));
    const roundHandlers = useRef(null);

    useEffect(() => {
        if (inited.current) return;
        console.log(isHost);

        socket.on('startingState', (state) => {
            renderStartingState(state, players);
            renderPlayerInfo(state.players, players);
            addListenersForSwapPhase(swapHandler.current);
        });

        socket.on('updateHand', ({player, hand}) => {
            const playerNumber = players.current[player].localIndex;
            reRenderHand(playerNumber, hand);
        })

        socket.on('nextPlayer', (playerId) => {
            if (!roundHandlers.current) {
                const playerIndex = players.current[uid.current].serverIndex;
                roundHandlers.current = getRoundHandlers(socket, playerIndex, room, chosenFromHand, chosenFromFaceUp);
            }

            updateCurrent(players.current[playerId].localIndex);
            if (playerId === uid.current) {
                chosenFromHand.current = [];
                chosenFromFaceUp.current = [];
                setRoundEventListeners(roundHandlers.current, useHandler);
                document.getElementById('playButton').disabled = false;
                return;
            }

            document.getElementById('playButton').disabled = true;
        })

        socket.on('updateCentralPile', (cards) => {
            const centralPile = document.getElementById('centralPile');

            if (!cards.length) {
                centralPile.innerHTML = '';
                return;
            }

            updateCentralPile(cards);
        });

        socket.on('updateDrawingPile', (showDrawingPile) => {
            setDrawingPile(showDrawingPile);
        });

        socket.on('gameOver', () => {
            console.log(isHost)
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
        };

        socket.emit('playerAction', req);
        chosenFromFaceUp.current = [];
        chosenFromHand.current = [];
    };

    const sendReady = () => {
        socket.emit('ready', {room, uid:uid.current});
        removeSwapPhaseEventListeners(swapHandler.current);
        removeMarks(chosenFromHand, chosenFromFaceUp);
        document.getElementById('readyButton').style.display = 'none';
        document.getElementById('swapButton').style.display = 'none';
        document.getElementById('playButton').style.display = 'inline-block';
        document.getElementById('sortButton').style.display = 'inline-block';
    }

    const playCards = () => {
        console.log('play');
        const req = {};
        if (chosenFromHand.current.length) {
            req.cards = chosenFromHand.current.map(card => card.index);
            req.origin = 'hand';
        } else if (chosenFromFaceUp.current.length) {
            req.cards = chosenFromFaceUp.current.map(card => card.index);
            req.origin = 'faceUp'
        } else {
            return;
        }
        req.player = players.current[uid.current].serverIndex;
        req.room = room;
        socket.emit('playCards', req);
        console.log(req.cards);
    }

    return (
        <div id="container">
            <div id="centralPile"></div>
            <div id="drawPile"></div>
            <div id="discardPile"></div>
            <button id="swapButton" onClick={swap} >Swap</button>
            <button id="readyButton" onClick={sendReady}>Ready</button>
            <button id="playButton" onClick={playCards}>Play Cards</button>
            <button id="sortButton">Sort Hand</button>
        </div>
    );
}

export default GameWindow;
