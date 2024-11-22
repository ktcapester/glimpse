import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CardSearch } from '../interfaces/backend.interface';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CardSuggestionService {
  private suggestionSubject = new BehaviorSubject<CardSearch[]>([]);

  constructor() {}

  getCurrentSuggestionsListener() {
    return this.suggestionSubject.asObservable();
  }

  updateSuggestions(cards: CardSearch[]) {
    this.suggestionSubject.next(cards);
  }

  clearSuggestions() {
    this.suggestionSubject.next([]);
  }
}
