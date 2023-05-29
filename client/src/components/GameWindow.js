import React, {useEffect, useRef, useState} from 'react';
import renderStartingState from "@/util/render";

function GameWindow({socket}) {
    let inited = useRef(false);
    const drawPile = useRef();
    const discardPile = useRef();
    const centralPile = useRef();

    useEffect(() => {
        if (inited.current) return;
        socket.on('startingState', (state) => {
            getConfig().then((config) => {
                renderStartingState(state, config);
            })
        });
        inited.current = true;
    }, []);

    const getConfig = async () => {
        const response = await fetch('/api/config');
        const {config} = await response.json();
        return await JSON.parse(config);
    }

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
            <div id="hand"></div>
            <div id="player1"></div>
            <div id="player2"></div>
            <div id="player3"></div>
            <div id="player4"></div>
            <div id="player5"></div>
            <div id="player6"></div>
            <div id="player7"></div>
        </div>
    );
}

export default GameWindow;
