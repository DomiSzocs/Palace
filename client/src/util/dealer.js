// import Deck from "./deck"
//
// export default class Dealer {
//     constructor(numberOfPlayers, numberOfDecks) {
//         this.numberOfPlayers = numberOfPlayers;
//         this.deck = new Deck(numberOfDecks);
//     }
//
//     dealToPlayer = (deck, config) => {
//         dealThree(deck, config.faceDown);
//         dealThree(deck, config.faceUp);
//         dealThree(deck, config.hand);
//     }
//
//     deal = () => {
//         this.deck.shuffle();
//         createDrawPile(this.deck);
//         getConfig().then((config) => {
//             for (let i = 0; i < this.numberOfPlayers; i++) {
//                 this.dealToPlayer(this.deck, config[i]);
//             }
//         })
//     };
// }
//
// const createDrawPile = (deck) => {
//     const drawPile = document.getElementById("drawPile");
//     deck.cards.forEach((card) => {
//         const cardHtml = card.getSide(false);
//         cardHtml.style.top = '40%';
//         cardHtml.style.left = '50%';
//         drawPile.appendChild(cardHtml);
//     })
// };
//
// const dealThree = (deck, config) => {
//     const drawPile = document.getElementById(config.drawPile);
//     const targetPile = document.getElementById(config.targetDiv);
//
//     for (let i = 0; i < 3; i++) {
//         const topCardHtml = drawPile.children[0];
//         drawPile.removeChild(topCardHtml);
//         const topCard = deck.getTopCard().getSide(config.side);
//         topCard.style.top = `${config.top + config.topOffset * i}%`;
//         topCard.style.left = `${config.left + config.leftOffset * i}%`;
//         topCard.style.fontSize = `${config.font}rem`;
//         topCard.style.transform = `rotate(${config.rotate}deg)`;
//         targetPile.appendChild(topCard);
//         deck.cards.pop();
//     }
// }
//
// const getConfig = async () => {
//     const response = await fetch('/api/config');
//     const {config} = await response.json();
//     return await JSON.parse(config);
// }
