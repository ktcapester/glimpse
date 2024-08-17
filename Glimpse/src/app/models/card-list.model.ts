import { ScryfallCard } from "../interfaces/scryfall-card.interface";

export class CardList {
    id: string;
    name: string;
    cards: Map<string, [ScryfallCard, number]>;

    constructor() {
        this.id = '';
        this.name = '';
        this.cards = new Map();
    }
}