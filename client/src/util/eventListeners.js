import {chooseACard, getClickedCard} from "@/util/userInteractions";

export const addListenersForSwapPhase = (handler) => {
    const faceUp = document.getElementById('0').children[1];
    const hand = document.getElementById('localPlayerHand');

    faceUp.addEventListener('click', handler);
    hand.addEventListener('click', handler);
};

export const removeSwapPhaseEventListeners = (handler) => {
    const faceUp = document.getElementById('0').children[1];
    const hand = document.getElementById('localPlayerHand');

    faceUp.removeEventListener('click', handler);
    hand.removeEventListener('click', handler);
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

