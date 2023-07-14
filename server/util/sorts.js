import {getCardsValues} from "./card.js";

export const sortHands = (a, b) => {
    if (a.best < b.best) {
        return -1;
    }

    if (a.best > b.best) {
        return 1;
    }

    if (a.second < b.second) {
        return -1;
    }

    if (a.second > b.second) {
        return 1;
    }

    if (a.third < b.third) {
        return -1;
    }

    if (a.third > b.third) {
        return 1;
    }

    if (a.player > b.player) {
        return -1;
    }

    if (a.player >= b.player) {
        return 1;
    }
}

export const sortCards = (a, b) => {
    const cardValues = getCardsValues();
    return cardValues[a.rank] < cardValues[b.rank] ? -1 : 1;
}
