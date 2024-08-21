import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';
import { CardList } from '../models/card-list.model';
import { ScryfallList } from '../interfaces/scryfall-list.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlimpseStateService {

  user: User | null = null;
  searchedCard: ScryfallCard | null = null;
  searchedPrints: ScryfallList | null = null;
  currentList: CardList | null = null;
  private cardSubject = new BehaviorSubject<ScryfallCard|null>(null);
  card$ = this.cardSubject.asObservable();
  private printsSubject = new BehaviorSubject<ScryfallList|null>(null);
  prints$ = this.printsSubject.asObservable();

  constructor() { }

  getUser() {
    return this.user;
  }

  setSearchedCard(card: ScryfallCard) {
    this.cardSubject.next(card);
  }

  getSearchedCard() {
    return this.cardSubject.value;
  }

  getCurrentList() {
    return this.user?.getActiveList();
  }

  setSearchedPrints(prints: ScryfallList) {
    this.printsSubject.next(prints);
  }

  getPrints() {
    return this.printsSubject.value;
  }
}
