import {auth} from "@/firebase/fireBaseConfig";

const renderStartingState = (state, config) => {
    console.log(config);
    console.log(state);

    const drawPile = document.getElementById('drawPile');
    const cardHtml = getHtml(null, false);
    cardHtml.style.top = '40%';
    cardHtml.style.left = '50%';
    drawPile.appendChild(cardHtml);

    let playerNumber = 1;
    state.players.forEach((player) => {
        console.log(player)
        if (player.uid === auth.currentUser.uid) {
            renderHand(player, config[0]);
        } else {
            renderHand(player, config[playerNumber++]);
        }
    });
}

const renderHand = (player, config) => {
    console.log(config);
    renderThree(player.faceDown, config.faceDown);
    renderThree(player.faceUp, config.faceUp);
    renderThree(player.hand, config.hand);
}

const renderThree = (cards, style) => {
    const hand = document.getElementById(style.targetDiv)

    for (let i = 0; i < 3; i++) {
        const cardHtml = getHtml(cards[i], style.side);
        console.log(cardHtml);
        cardHtml.style.top = `${style.top + style.topOffset * i}%`;
        cardHtml.style.left = `${style.left + style.leftOffset * i}%`;
        cardHtml.style.fontSize = `${style.font}rem`;
        cardHtml.style.transform = `rotate(${style.rotate}deg)`;
        hand.appendChild(cardHtml);
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

export default renderStartingState;
