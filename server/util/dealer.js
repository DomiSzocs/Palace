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
            dealt.uid = player;
            players.push(dealt);
        });
        return players;
    };
}

// const createDrawPile = (deck) => {
//     const drawPile = document.getElementById("drawPile");
//     deck.cards.forEach((card) => {
//         const cardHtml = card.getSide(false);
//         cardHtml.style.top = '40%';
//         cardHtml.style.left = '50%';
//         drawPile.appendChild(cardHtml);
//     })
// };

const dealThree = (deck) => {
    return deck.cards.splice(-3);
}

// const getConfig = async () => {
//     const response = await fetch('/api/config');
//     const {config} = await response.json();
//     return await JSON.parse(config);
// }
