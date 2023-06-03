import React, {useEffect, useRef} from 'react';
import {renderStartingState, reRenderHand} from "@/util/render";
import {auth} from "@/firebase/fireBaseConfig";

function GameWindow({socket, room}) {
    let inited = useRef(false);
    const drawPile = useRef();
    const discardPile = useRef();
    const centralPile = useRef();
    const chosenFromHand = useRef(null);
    const chosenFromFront = useRef(null);
    const config = useRef(null);
    const players = useRef({});
    const uid = useRef(auth.currentUser.uid)

    useEffect(() => {
        if (inited.current) return;
        socket.on('startingState', (state) => {
            getConfig().then((data) => {
                renderStartingState(state, data, players);
                addListenersForSwapPhase();
                config.current = data;
            })
        });

        socket.on('updateHand', ({player, hand}) => {
            const playerNumber = players.current[player].localIndex;
            reRenderHand(playerNumber, hand, config.current[playerNumber]);
        })
        inited.current = true;
    }, []);

    const addListenersForSwapPhase = () => {
      const faceUp = document.getElementById('faceUp');
      const hand = document.getElementById('hand');

      faceUp.addEventListener('click', chooseToSwap);
      hand.addEventListener('click', chooseToSwap);
    };

    const removeSwapPhaseEventListeners = () => {
        const faceUp = document.getElementById('faceUp');
        const hand = document.getElementById('hand');

        faceUp.removeEventListener('click', chooseToSwap);
        hand.removeEventListener('click', chooseToSwap);
    };

    const chooseToSwap = (element) => {
        const card = getClickedCard(element.target);
        if (card.parentElement.id === 'hand') {
            chooseCard(card, card.parentElement, chosenFromHand);
        } else {
            chooseCard(card, card.parentElement, chosenFromFront);
        }

    }

    const getClickedCard = (clicked) => {
        if (clicked.classList[0] === 'suit') {
            return clicked.parentElement;
        }
        return clicked;
    }

    const chooseCard = (card, parent, container) => {
        const cards = Array.from(parent.children);
        const clicked = cards.indexOf(card);

        if (container.current === clicked) {
            unmark(card, parent.id, container);
            return;
        }

        if (container.current) return;

        mark(card, clicked, parent.id, container);
    };

    const mark = (card, cardIndex, id, container) => {
        card.style.top = `${config.current[0][id].top - 2}%`
        container.current = cardIndex;
    }

    const unmark = (card, id, container) => {
        card.style.top = `${config.current[0][id].top}%`
        container.current = null;
    }

    const swap = () => {
        if (chosenFromHand.current === null) return;
        if (chosenFromFront.current === null) return;

        const req = {
            action: 'swap',
            serverIndex: players.current[uid.current].serverIndex,
            uid: uid.current,
            hand: chosenFromHand.current,
            faceUp: chosenFromFront.current,
            room
        }
        socket.emit('playerAction', req);
        chosenFromFront.current = null;
        chosenFromHand.current = null;
    };

    const sendReady = () => {
        socket.emit('ready', {room, uid:uid.current})
        removeSwapPhaseEventListeners();
        document.getElementById("readyButton").style.display = 'none';
        document.getElementById("swapButton").style.display = 'none';
    }

    const getConfig = async () => {
        const response = await fetch('/api/config');
        const {config} = await response.json();
        return await JSON.parse(config);
    };

    // const draw = () => {
    //     console.log(dealer);
    //     const topCard = drawPile.current.children[0];
    //     drawPile.current.removeChild(topCard);
    //     const chosenCard = dealer.deck.getTopCard().getSide(true);
    //     chosenCard.style.top = '40%';
    //     chosenCard.style.left = '45%';
    //     centralPile.current.appendChild(chosenCard);
    //     dealer.deck.cards.pop();
    //
    //     drawPile.current.removeEventListener('click', draw);
    // };

    return (
        <div id="container">
            <div ref={centralPile} id="centralPile"></div>
            <div ref={drawPile} id="drawPile"></div>
            <div ref={discardPile} id="discardPile"></div>
            <div id="player">
                <div id="faceDown"></div>
                <div id="faceUp"></div>
                <div id="hand"></div>
            </div>
            <div id="player1"></div>
            <div id="player2"></div>
            <div id="player3"></div>
            <div id="player4"></div>
            <div id="player5"></div>
            <div id="player6"></div>
            <div id="player7"></div>
            <button id="swapButton" onClick={swap} >Swap</button>
            <button id="readyButton" onClick={sendReady}>Ready</button>
            <button id="playButton">Play Cards</button>
            <button id="sortButton">Sort Hand</button>
        </div>
    );
}

export default GameWindow;
