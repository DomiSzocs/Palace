import {getCardsValues} from "./card.js";

export const addToCentralPile = (card, centralPile) => {
    centralPile.push(card)

    const fourOfAKind = checkIfFourOfAKind(centralPile.slice(-4));

    if (card.rank === '10' || fourOfAKind) {
        centralPile = [];
    }

    return centralPile;
}

export const addCardsToCentralPile = (centralPile, cards, indexes) => {
    const topCard = centralPile.slice(-1);
    const firstCard = cards[indexes[0]];

    if (!isPlayable(firstCard, topCard)) return

    const playedCards = indexes.map(index => cards[index]);

    let usedHand = [];
    for (let i = 0; i < cards.length; i++) {
        if (indexes.includes(i)) continue;

        usedHand.push(cards[i]);
    }

    let updatedCentralPile = centralPile.concat(playedCards);

    const fourOfAKind = checkIfFourOfAKind(updatedCentralPile.slice(-4));

    if (firstCard.rank === '10' || fourOfAKind) {
        updatedCentralPile = [];
    }

    return {playedCards, updatedCentralPile, usedHand};
}

export const addCardsToPlayerHand = (hand, cards) => {
    const newPlayerHand = [...hand];
    cards.forEach(card => {
        if (card.rank !== 'JOKER') {
            newPlayerHand.push(card)
        }
    })

    return newPlayerHand;
}

const isPlayable = (card, topCard) => {
    const cardValues = getCardsValues();

    return !topCard.length || topCard[0].rank === '2' || cardValues[card.rank] >= cardValues[topCard[0].rank];
}

const checkIfFourOfAKind = (cards) => {
    if (cards.length < 4) return false;

    const reference = cards[0].rank;
    return cards.every(card => card.rank === reference);
}
