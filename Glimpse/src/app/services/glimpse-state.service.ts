import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';
import { CardList } from '../models/card-list.model';
import { ScryfallList } from '../interfaces/scryfall-list.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlimpseStateService {
  // internals
  private userSubject = new BehaviorSubject<User | null>(null);
  private userListSubject = new BehaviorSubject<CardList | null>(null);
  private cardSubject = new BehaviorSubject<ScryfallCard | null>(null);
  private printsSubject = new BehaviorSubject<ScryfallList | null>(null);
  private errorMessageSubject = new BehaviorSubject<string>(
    'Default Error Message'
  );

  constructor() {}

  // get observables for other components
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
