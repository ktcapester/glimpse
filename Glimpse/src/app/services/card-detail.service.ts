import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BackendGlueService } from './backend-glue.service';
import { BehaviorSubject } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { CardListItem } from '../interfaces/backend.interface';

@Injectable({
  providedIn: 'root',
})
export class CardDetailService {
  private cardFromIDSubject = new BehaviorSubject<number>(0);
  private patchCardSubject = new BehaviorSubject<CardListItem | null>(null);

  cardFromID$ = this.cardFromIDSubject.pipe(
    filter((id) => !!id),
    switchMap((id) => {
      return this.glue.getCardDetails(id).pipe(
        map((results) => {
          if (typeof results === 'string') {
            // error response
            this.router.navigate(['/404']);
            throw new Error('Error response handled');
          } else {
            // successful response
            // aka response is a CardListItem obj
            return results;
          }
        }),
        catchError((error) => {
          console.error('An unexpected error occurred in cardFromID$:', error);
          this.router.navigate(['/404']);
          return [];
        })
      );
    })
  );

  patchCard$ = this.patchCardSubject.pipe(
    filter(
      (card_list_item): card_list_item is CardListItem => !!card_list_item
    ),
    switchMap((cardLI) => {
      return this.glue.patchCardDetails(cardLI).pipe(
        map((results) => {
          if (typeof results === 'string') {
            // error response
            this.router.navigate(['/404']);
            throw new Error('Error response handled');
          } else {
            // successful response
            // response is a { currentTotal:number } obj
            // extract the number out of it and pass it along
            return results.currentTotal;
          }
        }),
        catchError((error) => {
          console.error('An unexpected error occurred in patchCard$:', error);
          this.router.navigate(['/404']);
          return [];
        })
      );
    })
  );

  constructor(private glue: BackendGlueService, private router: Router) {}

  updateDetailFromID(id: number): void {
    this.cardFromIDSubject.next(id);
  }

  clearCardDetails() {
    this.cardFromIDSubject.next(0);
  }

  updatePatchCard(card: CardListItem) {
    this.patchCardSubject.next(card);
  }

  clearPatchCard() {
    this.patchCardSubject.next(null);
  }
}
