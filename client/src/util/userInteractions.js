export const chooseACard = (card, parent, container) => {
    const cards = Array.from(parent.children);
    const clicked = cards.indexOf(card);

    if (cards.length > 3) {
        return;
    }

    if (container.current[0] === clicked) {
        unmark(card);
        container.current.pop();
        return;
    }

    if (container.current.length) return;

    mark(card);
    container.current.push(clicked);
};

export const addCard = (card, parent, container) => {
    const cards = Array.from(parent.children);
    const clicked = cards.indexOf(card);
    const rank = card.dataset.value.split('\n')[0];

    const index = container.current.findIndex(a => a.rank === rank && a.index === clicked);
    if (index !== -1) {
        unmark(card);
        container.current.splice(index, 1);
        return;
    }

    if (!container.current.length) {
        container.current.push({rank, index: clicked});
        mark(card);
        return;
    }

    if (container.current[0].rank === rank) {
        container.current.push({rank, index: clicked});
        mark(card);
    }
}

export const getClickedCard = (clicked) => {
    if (clicked.classList[0] === 'suit') {
        return clicked.parentElement;
    }
    return clicked;
}

const mark = (card) => {
    card.classList.add('marked');
}

const unmark = (card) => {
    card.classList.remove('marked');
}

export const removeMarks = (handContainer, faceUpContainer) => {
    const hand = document.getElementById('localPlayerHand');
    handContainer.current.forEach((card) => {
        hand.children[card].classList.remove('marked');
    })

    const faceUp = document.getElementById('0').children[1];
    faceUpContainer.current.forEach((card) => {
        faceUp.children[card].classList.remove('marked');
    })
    handContainer.current = [];
    faceUpContainer.current = [];
}
