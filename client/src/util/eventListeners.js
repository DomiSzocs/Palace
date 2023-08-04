import {addCard, chooseACard, getClickedCard} from "@/util/userInteractions";

export const addListenersForSwapPhase = (handler) => {
    const hand = document.getElementById('localPlayerHand');
    const faceUp = document.getElementById('0').children[1];

    hand.addEventListener('mousedown', handler);
    faceUp.addEventListener('mousedown', handler);

    hand.classList.add('clickable');
    faceUp.classList.add('clickable');
};

export const removeSwapPhaseEventListeners = (handler) => {
    const hand = document.getElementById('localPlayerHand');
    const faceUp = document.getElementById('0').children[1];

    hand.removeEventListener('mousedown', handler);
    faceUp.removeEventListener('mousedown', handler);
    hand.classList.remove('clickable');
    faceUp.classList.remove('clickable');
};

export const getSwapHandler = (handContainer, faceUpContainer) => {
    return (element) => {
        const card = getClickedCard(element.target);
        if (card.parentElement.id === 'localPlayerHand') {
            chooseACard(card, card.parentElement, handContainer);
        } else {
            chooseACard(card, card.parentElement, faceUpContainer);
        }
    }
}

export const getRoundHandlers = (socket, playerIndex, room, handContainer, faceUpContainer) => {
    return {
        handlePlayFromDrawingPile: getPlayFromDrawingPileHandler(socket, playerIndex, room),
        handlePlayFromHand: getPlayMultipleCardsHandler(handContainer),
        handlePlayFromFaceUp: getPlayMultipleCardsHandler(faceUpContainer),
        handlePlayFromFaceDown: getPlayAFaceDownCardHandler(socket, playerIndex, room),
        handleClickOnCentralPile: clickOnCentralPileHandler(socket, playerIndex, room)
    }
}

export const getPlayFromDrawingPileHandler = (socket, serverIndex, room) => {
    return () => {
        const req = {
            origin: 'deck',
            card: -1,
            player: serverIndex,
            room: room
        }
        socket.emit('tryCard', req);
    }
}

export const getPlayMultipleCardsHandler = (container) => {
    return (element) => {
        const card = getClickedCard(element.target);
        addCard(card, card.parentElement, container);
    }
}

export const getPlayAFaceDownCardHandler = (socket, serverIndex, room) => {
    return (element) => {
        const card = getClickedCard(element.target);
        const req = {
            card: card,
            origin: 'faceDown',
            player: serverIndex,
            room: room,
        }
        socket.emit('tryCard', req);
    }
}

export const clickOnCentralPileHandler = (socket, serverIndex, room) => {
    return (element) => {
        const req = {
            player: serverIndex,
            room: room,
        }
        socket.emit('takeCentralPile', req);
    }
}

export const setRoundEventListeners = (handlers, setHandler) => {
    setHandler(document.getElementById('centralPile'), handlers.handleClickOnCentralPile);

    if (isTopCardJoker()) {
        console.log('joker');
        return;
    }

    setHandler(document.getElementById('drawPile'), handlers.handlePlayFromDrawingPile)

    if (setHandler(document.getElementById('localPlayerHand'), handlers.handlePlayFromHand)) return;

    if (setHandler(document.getElementById('0').children[1], handlers.handlePlayFromFaceUp)) return;

    setHandler(document.getElementById('0').children[0], handlers.handlePlayFromFaceDown);
}

export const useHandler = (parent, handler) => {
    Array.from(parent.children).forEach((card) => {
        card.addEventListener('mousedown', handler);
        card.classList.add('clickable');
    });

    return parent.children.length !== 0;
}

const isTopCardJoker = () => {
    const centralPile = document.getElementById('centralPile');
    const topCard = Array.from(centralPile.children).slice(-1)[0];

    if (!topCard) return false

    return topCard.dataset.value.split('\n')[0] === 'JOKER';
};

