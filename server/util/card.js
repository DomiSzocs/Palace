export default class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
}

export const getCardsValues = () => {
    return {'3': 0, '4': 1, '5': 2, '6': 3, '7': 4, '8': 5, '9': 6,
        'J': 7, 'Q': 8,'K': 9, 'A': 10, '2': 11, '10': 12, 'JOKER': 13};
}

export const cardToObject = (card) => {
    return {
        suit: card.suit,
        rank: card.rank
    };
};
