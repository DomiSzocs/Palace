import {sortCards, sortHands} from "./sorts.js";

export const getFirstPlayer = (players) => {
    const hands = []
    for(let i = 0; i < players.length; i++) {
        const playerHandCopy = [...players[i].hand];
        const sorted = playerHandCopy.sort(sortCards);
        hands.push({
            best: sorted[0].rank,
            second: sorted[1].rank,
            third: sorted[2].rank,
            player: i,
            uid: players[i].info.uid
        });
    }
    hands.sort(sortHands);
    return {
        index: hands[0].player,
        uid: hands[0].uid
    };
};

export const getTheNextPlayer = (current, players, tryToKeepCurrent) => {
    const numberOfPlayers = players.length;
    let index = current.index;

    if (!tryToKeepCurrent) {
        index = (index + 1) % numberOfPlayers;
    }

    while (!players[index].stillPlaying) {
        index = (index + 1) % numberOfPlayers;
    }
    const uid = players[index].info.uid;
    return {index, uid};
}
