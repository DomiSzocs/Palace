export const chooseACard = (card, parent, container) => {
    const cards = Array.from(parent.children);
    const clicked = cards.indexOf(card);

    if (container.current[0] === clicked) {
        unmark(card);
        container.current.pop();
        return;
    }

    if (container.current.length) return;

    mark(card);
    container.current.push(clicked);
};

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
