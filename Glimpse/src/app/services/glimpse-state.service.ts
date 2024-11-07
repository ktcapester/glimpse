import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';
import { CardList } from '../models/card-list.model';
import { ScryfallList } from '../interfaces/scryfall-list.interface';
import { BehaviorSubject } from 'rxjs';
import { CardSearch } from '../interfaces/backend.interface';

@Injectable({
  providedIn: 'root',
})
export class GlimpseStateService {
  // internals
  private userSubject = new BehaviorSubject<User | null>(null);
  private userListSubject = new BehaviorSubject<CardList | null>(null);
  private cardSubject = new BehaviorSubject<ScryfallCard | null>(null);
  private backendSubject = new BehaviorSubject<CardSearch | null>(null);
  private printsSubject = new BehaviorSubject<ScryfallList | null>(null);
  private errorMessageSubject = new BehaviorSubject<string>(
    'Default Error Message'
  );

  constructor() {
    const savedCard = sessionStorage.getItem('lastSearchedCard');
    if (savedCard) {
      this.backendSubject.next(JSON.parse(savedCard));
    }
  }

  // get observables for other components
  getBackendCardListener() {
    return this.backendSubject.asObservable();
  }

  getUserListener() {
    return this.userSubject.asObservable();
  }

  getUserListListener() {
    return this.userListSubject.asObservable();
  }

  getCardListener() {
    return this.cardSubject.asObservable();
  }

  getPrintsListener() {
    return this.printsSubject.asObservable();
  }

  getErrorMessageListener() {
    return this.errorMessageSubject.asObservable();
  }

  // get & set current values
  setBackendCard(card: CardSearch | null) {
    sessionStorage.setItem('lastSearchedCard', JSON.stringify(card));
    this.backendSubject.next(card);
  }

  getUser() {
    return this.userSubject.value;
  }

  setUser(user: User | null) {
    this.userSubject.next(user);
  }

  getCurrentList() {
    return this.userListSubject.value;
  }

  setCurrentList(list: CardList) {
    this.userListSubject.next(list);
  }

  getSearchedCard() {
    return this.cardSubject.value;
  }

  setSearchedCard(card: ScryfallCard) {
    this.cardSubject.next(card);
  }

  getPrints() {
    return this.printsSubject.value;
  }

  setSearchedPrints(prints: ScryfallList) {
    this.printsSubject.next(prints);
  }

  getErrorMessage() {
    return this.errorMessageSubject.value;
  }

  setErrorMessage(message: string) {
    this.errorMessageSubject.next(message);
  }
}
