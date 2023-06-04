import Deck from "./deck"

export default class Dealer {
    constructor(numberOfPlayers, numberOfDecks) {
        this.numberOfPlayers = numberOfPlayers;
        this.deck = new Deck(numberOfDecks);
    }

    dealToPlayer = (deck, playerName) => {
        return {
            faceDown: dealThree(deck),
            faceUp: dealThree(deck),
            hand: dealThree(deck),
            uid: playerName
        }
    }

    deal = () => {
        this.deck.shuffle();
        let players = [];
        for (let i = 0; i < this.numberOfPlayers; i++) {
            players.push(this.dealToPlayer(this.deck, i));
        }
        return players
    };
}

const dealThree = (deck) => {
    const pile = [];
    for (let i = 0; i < 3; i++) {
        const topCard = deck.getTopCard();
        pile.push({rank: topCard.rank, suit: topCard.suit})
        deck.cards.pop();
    }
    return pile;
}
