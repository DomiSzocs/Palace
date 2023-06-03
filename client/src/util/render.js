import {auth} from "@/firebase/fireBaseConfig";

export const renderStartingState = (state, config, players) => {
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
            renderHand(player[i], config[0]);
        } else {
            players.current[player[i].uid] = {
                localIndex: playerNumber,
                serverIndex: i
            };
            renderHand(player[i], config[playerNumber++]);
        }
    }
}

export const reRenderHand = (playerNumber, player, config) => {
    if (playerNumber !== 0) {
        const parentDiv = document.getElementById(config.faceUp.targetDiv);
        parentDiv.innerHTML = "";
        renderHand(player, config);
    } else {
        reRenderThree(player.faceDown, config.faceDown);
        reRenderThree(player.faceUp, config.faceUp);
        reRenderThree(player.hand, config.hand);
    }
}

const renderHand = (player, config) => {
    renderPile(player.faceDown, config.faceDown);
    renderPile(player.faceUp, config.faceUp);
    renderPile(player.hand, config.hand);
}

const reRenderThree = (cards, style) => {
    console.log(style.targetDiv);
    deleteThree(style.targetDiv);
    renderPile(cards, style);
};

const deleteThree = (parentDivId) => {
    const parentDiv = document.getElementById(parentDivId);
    parentDiv.innerHTML = "";
}

const renderPile = (cards, style) => {
    const hand = document.getElementById(style.targetDiv)

    for (let i = 0; i < cards.length; i++) {
        const cardHtml = getHtml(cards[i], style.side);
        cardHtml.style.top = `${style.top + style.topOffset * i}%`;
        cardHtml.style.left = `${style.left + style.leftOffset * i}%`;
        cardHtml.style.fontSize = `${style.font}rem`;
        cardHtml.style.transform = `rotate(${style.rotate}deg)`;
        cardHtml.style.zIndex = `${i}`;
        console.log(cardHtml);
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
