export default class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    getSide = (side) => {
        if (side) {
            return this.getFace()
        }
        return this.getBack();
    }

    color = () => {
        if (this.rank === "2" || this.rank === "10" || this.rank === "JOKER") {
            return "gold";
        }
        return (this.suit === "♥" || this.suit === "♦") ? "red" : "black";
    }

    getData = () => {
        if(this.rank === "JOKER") {
            return this.rank;
        }
        return `${this.rank}\n${this.suit}`;
    }

    getBack = () => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.classList.add("back");
        return cardDiv;
    }

    getFace = () =>  {
        const suitDiv = document.createElement("div");
        suitDiv.classList.add("suit")
        suitDiv.innerHTML = this.suit;

        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.classList.add(this.color());
        cardDiv.classList.add("face");
        cardDiv.dataset.value = this.getData();

        cardDiv.appendChild(suitDiv);
        return cardDiv;
    }
}


