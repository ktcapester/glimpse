import { Injectable, signal } from '@angular/core';
import { CardDisplayOnly } from '../interfaces/backend.interface';

@Injectable({
  providedIn: 'root',
})
export class CardSuggestionService {
  private _cards = signal<CardDisplayOnly[]>([]);
  readonly cards = this._cards.asReadonly();

  updateSuggestions(cards: CardDisplayOnly[]) {
    this._cards.set(cards);
  }
}
