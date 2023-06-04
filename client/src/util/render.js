import {auth} from "@/firebase/fireBaseConfig";

export const renderStartingState = (state, players) => {
    const drawPile = document.getElementById('drawPile');
    const cardHtml = getHtml(null, false);
    cardHtml.style.top = '40%';
    cardHtml.style.left = '50%';
    drawPile.appendChild(cardHtml);

    let playerNumber = 1;
    const player = state.players;
    for (let i = 0; i < player.length; i++) {
        if (player[i].uid === auth.currentUser.uid) {
            players.current[player[i].uid] = {
                localIndex: 0,
                serverIndex: i
            };
            renderLocalPlayersHand(player[i].hand);
        } else {
            players.current[player[i].uid] = {
                localIndex: playerNumber++,
                serverIndex: i
            };

        }
        renderPlayer(player[i], players.current[player[i].uid].localIndex);
    }
}

export const reRenderHand = (playerNumber, hand) => {
    if (playerNumber === 0) {
        const localPlayersHand = document.getElementById('localPlayerHand');
        localPlayersHand.innerHTML = '';
        renderPile(hand.hand, true, localPlayersHand);
    }

    clearHand(playerNumber);
    renderHand(hand, playerNumber)
}

const renderPlayer = (hand, playerNumber) => {
    createHandHtml(playerNumber);
    renderHand(hand, playerNumber);
}

const renderHand = (hand, playerNumber) => {
    const playerDiv = document.getElementById(playerNumber);
    renderPile(hand.faceDown, false, playerDiv.children[0]);
    renderPile(hand.faceUp, true, playerDiv.children[1]);
    renderPile(hand.hand, false, playerDiv.children[2]);
}

const createHandHtml = (playerNumber) => {
    const container = document.getElementById('container');
    const baseDiv = document.createElement('div');
    baseDiv.id = playerNumber;
    baseDiv.classList.add('playerCards');

    const faceDownDiv = document.createElement('div');
    faceDownDiv.classList.add('faceDown');

    const faceUpDiv = document.createElement('div');
    faceUpDiv.classList.add('faceUp');

    const handDiv = document.createElement('div');
    handDiv.classList.add('hand');

    baseDiv.appendChild(faceDownDiv);
    baseDiv.appendChild(faceUpDiv);
    baseDiv.appendChild(handDiv);
    container.appendChild(baseDiv);
}

const renderLocalPlayersHand = (cards) => {
    const handPile = document.createElement('div');
    handPile.id = 'localPlayerHand';
    const container = document.getElementById('container');
    container.appendChild(handPile);
    renderPile(cards, true, handPile);
}

const clearHand = (playerNumber) => {
    const playerDiv = document.getElementById(playerNumber);
    playerDiv.children[0].innerHTML = '';
    playerDiv.children[1].innerHTML = '';
    playerDiv.children[2].innerHTML = '';
};

const renderPile = (cards, side, targetPile) => {
    for (let i = 0; i < cards.length; i++) {
        const cardHtml = getHtml(cards[i], side);
        cardHtml.style.setProperty('--n', i);
        targetPile.appendChild(cardHtml);
    }
};

const getHtml = (card, side) => {
    if (side) {
        return getFace(card);
    }
    return getBack();
};

const getFace = (card) => {
    const suitDiv = createSuit(card);
    return createCardDiv(card, suitDiv);
};

const getBack = () => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.classList.add("back");
    return cardDiv;
};

const createSuit = (card) => {
    const suitDiv = document.createElement("div");
    suitDiv.classList.add("suit")
    suitDiv.innerHTML = card.suit;
    return suitDiv;
}

const createCardDiv = (card, suitDiv) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.classList.add(getColor(card));
    cardDiv.classList.add("face");
    cardDiv.dataset.value = getData(card);
    cardDiv.appendChild(suitDiv);
    return cardDiv;
}

const getData = (card) => {
    if(card.rank === "JOKER") {
        return card.rank;
    }
    return `${card.rank}\n${card.suit}`;

};

const getColor = (card) => {
    if (card.rank === "2" || card.rank === "10" || card.rank === "JOKER") {
        return "gold";
    }
    return (card.suit === "♥" || card.suit === "♦") ? "red" : "black";
};
