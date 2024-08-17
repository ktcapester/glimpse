import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';
import { CardList } from '../models/card-list.model';

@Injectable({
  providedIn: 'root'
})
export class GlimpseStateService {

  user: User | null = null;
  searchedCard: ScryfallCard | null = null;
  currentList: CardList | null = null;

  constructor() { }

  getUser() {
    return this.user;
  }

  getSearchedCard() {
    return this.searchedCard;
  }

  getCurrentList() {
    return this.user?.getActiveList();
  }
}
