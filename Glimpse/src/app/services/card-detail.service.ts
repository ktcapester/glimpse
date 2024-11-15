import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BackendGlueService } from './backend-glue.service';
import { BehaviorSubject, of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
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
          tap((results) => {
            console.log('getCardDetails returned:', results);
            if (typeof results === 'string') {
              // error response
              this.router.navigate(['/404']);
            } else {
              // successful response
              // aka response is a CardListItem obj
              sessionStorage.setItem('lastCardDetail', JSON.stringify(results));
            }
          })
        );
    })
  );

  patchCard$ = this.patchCardSubject.pipe(
    filter((card_list_item) => !!card_list_item),
    switchMap((card_list_item) => {
      return this.glue.patchCardDetails(card_list_item!).pipe(
        tap((results) => {
          console.log('patchCardDetails returned:', results);
          if (typeof results === 'string') {
            // error response
            this.router.navigate(['/404']);
          } else {
            // successful response
            // aka response is a { currentTotal:number } obj
          }
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
