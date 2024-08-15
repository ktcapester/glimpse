import { Injectable } from '@angular/core';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';

@Injectable({
  providedIn: 'root'
})
export class CardStateService {

  currentCard: ScryfallCard | null;
  cardMap = new Map<string, [ScryfallCard, number]>();

  constructor() {
    this.currentCard = null;
  }

  getCardByName(cardName: string) {
    if (this.cardMap.has(cardName)) {
      return this.cardMap.get(cardName)![0];
    }
    return null;
  }

  addCardToList(card: ScryfallCard) {
    if (this.cardMap.has(card.name)) {
      this.cardMap.get(card.name)![1] += 1;
    }
    else {
      this.cardMap.set(card.name, [card, 1]);
    }
  }
}
