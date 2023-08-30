import Card from "./card.js";

export default class Deck {
    constructor(numberOfDecks) {
        this.cards = createDeck(numberOfDecks);
    }

    shuffle = () => {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }
}

const createDeck = (numberOfDecks) => {
    const suits = getSuits();
    const ranks = getRanks();
    const baseDeck = suits.flatMap(suit => {
        return ranks.map(rank => {
            return new Card(suit, rank);
        })
    })
    const jokers = createJokers();
    const fullDeck = baseDeck.concat(jokers);
    return [].concat(...Array(numberOfDecks).fill(fullDeck));
}

const getRanks = () => {
    const numbers = Array.from({length: 9}, (_, i) => (i + 2).toString())
    const letters = ["J", "Q", "K", "A"];
    return numbers.concat(letters);
}

const getSuits = () => {
    return ["♥", "♦", "♣", "♠"];
}

const createJokers = () => {
    const firstJoker = new Card("☺", "JOKER");
    const secondJoker = new Card("ツ", "JOKER");
    return [firstJoker, secondJoker];
}
