import {auth} from "@/firebase/fireBaseConfig";

export const updateCentralPile = (cards) => {
    const centralPile = document.getElementById('centralPile');
    cards.forEach((card) => {
        const cardHtml = getHtml(card, true);
        const rotation = `rotate(${Math.floor(Math.random() * 360)}deg)`;
        const offset = Math.floor(Math.random() * 2) - 0.5;
        const translation = `translate(${offset}vh, ${offset}vw)`;
        cardHtml.style.transform = rotation + translation;
        centralPile.appendChild(cardHtml);
    })
}

export const setDrawingPile = (showDrawingPile) => {
    const drawPile = document.getElementById('drawPile');
    if (!showDrawingPile) {
        Array.from(drawPile.children).forEach(child => drawPile.removeChild(child));
        return;
    }

    const cardHtml = getHtml(null, false);
    drawPile.appendChild(cardHtml);
}

export const renderStartingState = (state, players) => {
    setDrawingPile(true);
    let playerNumber = 1;
    const player = state.players;
    for (let i = 0; i < player.length; i++) {
        const uid = player[i].info.uid;
        if (uid === auth.currentUser.uid) {
            players.current[uid] = {
                localIndex: 0,
                serverIndex: i,
                name: player[i].info.name
            };
            renderLocalPlayersHand(player[i].hand);
        } else {
            players.current[uid] = {
                localIndex: playerNumber++,
                serverIndex: i
            };

        }
        renderPlayer(player[i], players.current[uid].localIndex);
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

export const reRenderLocalPlayerHand = (newHand) => {
    const localPlayersHand = document.getElementById('localPlayerHand');
    localPlayersHand.innerHTML = '';
    renderPile(newHand, true, localPlayersHand);
}

export const renderPlayerInfo = (state, players) => {
    state.forEach((player) => {
        const hand = document.getElementById(players.current[player.info.uid].localIndex);
        const nameTag = document.createElement('div');
        nameTag.classList.add('nameTag');
        nameTag.innerText = player.info.name;
        hand.appendChild(nameTag);
    })
};

export const updateCurrent = (playerIndex) => {
    deleteLastCurrent();
    setCurrent(playerIndex)
};

export const renderFinishedText = (divId) => {
    console.log(divId);
    const parentDiv = document.getElementById(divId);
    const finishedText = document.createElement("p");
    finishedText.innerText = "Waiting for other players to finish...";
    parentDiv.appendChild(finishedText);
}

const deleteLastCurrent = () => {
    const currents = document.getElementsByClassName('current');
    Array.from(currents).forEach(div => div.classList.remove('current'));
};

const setCurrent = (playerIndex) => {
    const currentPlayer = document.getElementById(playerIndex);
    currentPlayer.classList.add('current');
};

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
