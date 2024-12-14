import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CardDisplayOnly } from '../interfaces/backend.interface';

@Injectable({
  providedIn: 'root',
})
export class CardSuggestionService {
  private suggestionSubject = new BehaviorSubject<CardDisplayOnly[]>([]);

  constructor() {}

  getCurrentSuggestionsListener() {
    return this.suggestionSubject.asObservable();
  }

  updateSuggestions(cards: CardDisplayOnly[]) {
    this.suggestionSubject.next(cards);
  }

  clearSuggestions() {
    this.suggestionSubject.next([]);
  }
}
