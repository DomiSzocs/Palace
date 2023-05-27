import Card from "@/util/card";

export default class Deck {
    constructor(numberOfDecks) {
        this.cards = createDeck(numberOfDecks);
    }

    getTopCard = () => {
        return this.cards[this.cards.length - 1];
    }

    shuffle = () => { //Durstenfeld
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }

    sort = () => {
        this.cards.sort((a, b) => (a.rank < b.rank) ? 1 : -1);
    }
}

const createDeck = (numberOfDecks) => {
    const numbers = Array.from({length: 9}, (_, i) => (i + 2).toString())
    const letters = ["J", "Q", "K", "A"];
    const suits = ["♥", "♦", "♣", "♠"];
    const ranks = numbers.concat(letters);
    const baseDeck = suits.flatMap(suit => {
        return ranks.map(rank => {
            return new Card(suit, rank);
        })
    })
    const firstJoker = new Card("☺", "JOKER");
    const secondJoker = new Card("☺", "JOKER");
    const fullDeck = baseDeck.concat([firstJoker, secondJoker]);
    return [].concat(...Array(numberOfDecks).fill(fullDeck));
}
