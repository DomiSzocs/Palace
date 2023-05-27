import React, {useEffect, useRef, useState} from 'react';
import Dealer from "@/util/dealer";

function GameWindow(props) {
    let inited = useRef(false);
    const drawPile = useRef();
    const discardPile = useRef();
    const centralPile = useRef();

    const [dealer, setDealer] = useState(new Dealer(8, 3));

    useEffect(() => {
        if (inited.current) return;
        dealer.deal();
        drawPile.current.addEventListener('click', draw);

        inited.current = true;
    }, []);

    const draw = () => {
        console.log(dealer);
        const topCard = drawPile.current.children[0];
        drawPile.current.removeChild(topCard);
        const chosenCard = dealer.deck.getTopCard().getSide(true);
        chosenCard.style.top = '40%';
        chosenCard.style.left = '45%';
        centralPile.current.appendChild(chosenCard);
        dealer.deck.cards.pop();

        drawPile.current.removeEventListener('click', draw);
    };

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
