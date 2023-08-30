import React, {useEffect, useRef} from 'react';
import {auth} from "@/firebase/fireBaseConfig";
import {removeMarks} from "@/util/userInteractions";
import {
    renderPlayerInfo,
    renderStartingState,
    reRenderHand,
    updateCentralPile,
    updateCurrent,
    setDrawingPile,
    renderFinishedText,
    reRenderLocalPlayerHand
} from "@/util/render";
import {
    addListenersForSwapPhase,
    getRoundHandlers,
    getSwapHandler,
    removeSwapPhaseEventListeners,
    setRoundEventListeners,
    useHandler
} from "@/util/eventListeners";

function GameWindow({socket, room}) {
    const chosenFromHand = useRef([]);
    const chosenFromFaceUp = useRef([]);
    const players = useRef({});
    const uid = useRef(auth.currentUser.uid)
    const swapHandler = useRef(getSwapHandler(chosenFromHand, chosenFromFaceUp));
    const roundHandlers = useRef(null);

    useEffect(() => {
        socket.on('startingState', (state) => {
            renderStartingState(state, players);
            renderPlayerInfo(state.players, players);
            addListenersForSwapPhase(swapHandler.current);
        });

        socket.on('updateHand', ({player, hand}) => {
            const playerNumber = players.current[player].localIndex;
            chosenFromHand.current = [];
            chosenFromFaceUp.current = [];
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
        });

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

        socket.on('finished', () => {
            renderFinishedText('0');
        });

        socket.on('sortedHand', ({hand, isCurrentPlayer}) => {
            chosenFromHand.current = [];
            chosenFromFaceUp.current = [];

            reRenderLocalPlayerHand(hand);

            if (isCurrentPlayer) {
                const handler = roundHandlers.current.handlePlayFromHand;
                useHandler(document.getElementById('localPlayerHand'), handler);
            }
        });

        return () => {
            socket.off('startingState');
            socket.off('updateHand');
            socket.off('nextPlayer');
            socket.off('updateCentralPile');
            socket.off('updateDrawingPile');
            socket.off('finished');
            socket.off('sortedHand');
        }

    }, []);

    const swap = () => {
        if (!chosenFromHand.current.length) return;
        if (!chosenFromFaceUp.current.length) return;

        const req = {
            serverIndex: players.current[uid.current].serverIndex,
            uid: uid.current,
            hand: chosenFromHand.current[0],
            faceUp: chosenFromFaceUp.current[0],
            room
        };

        socket.emit('swap', req);
        chosenFromFaceUp.current = [];
        chosenFromHand.current = [];
    };

    const sendReady = () => {
        socket.emit('ready', room);
        removeSwapPhaseEventListeners(swapHandler.current);
        removeMarks(chosenFromHand, chosenFromFaceUp);
        document.getElementById('readyButton').style.display = 'none';
        document.getElementById('swapButton').style.display = 'none';
        document.getElementById('playButton').style.display = 'inline-block';
        document.getElementById('sortButton').style.display = 'inline-block';
    }

    const playCards = () => {
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
    }

    const sortHand = () => {
        const player = players.current[uid.current].serverIndex;
        const req = {
            room: room,
            player: player,
        }
        socket.emit('sortHand', req);
    }

    return (
        <div id="container">
            <div id="centralPile"></div>
            <div id="drawPile"></div>
            <div id="discardPile"></div>
            <div id="playerHandContainer">
                <div id="playerHandScrollable"></div>
            </div>
            <button id="swapButton" onClick={swap} >Swap</button>
            <button id="readyButton" onClick={sendReady}>Ready</button>
            <button id="playButton" onClick={playCards}>Play Cards</button>
            <button id="sortButton" onClick={sortHand}>Sort Hand</button>
        </div>
    );
}

export default GameWindow;
