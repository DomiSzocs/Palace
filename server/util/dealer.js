import Deck from "./deck.js"

export default class Dealer {
    constructor(players, numberOfDecks) {
        this.players = players;
        this.deck = new Deck(numberOfDecks);
    }

    dealToPlayer = (deck) => {
        const player = {};
        player['faceDown'] = dealThree(deck);
        player['faceUp'] = dealThree(deck);
        player['hand'] = dealThree(deck);
        return player;
    }

    deal = () => {
        this.deck.shuffle();
        const players = []
        this.players.forEach((player) => {
            const dealt = this.dealToPlayer(this.deck);
            dealt.info = player;
            players.push(dealt);
        });
        return players;
    };
}

const dealThree = (deck) => {
    return deck.cards.splice(-3);
}
