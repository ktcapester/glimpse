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
      const storedData = sessionStorage.getItem('lastCardDetail');
      if (storedData && id === JSON.parse(storedData).id) {
        return of(JSON.parse(storedData));
      } else {
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
      }
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
            sessionStorage.setItem(
              'lastCardListItem',
              JSON.stringify(card_list_item)
            );
          }
        })
      );
    })
  );

  constructor(private glue: BackendGlueService, private router: Router) {
    const storedResults = sessionStorage.getItem('lastCardDetail');
    if (storedResults) {
      this.cardFromIDSubject.next(JSON.parse(storedResults).id);
    }
  }

  updateDetailFromID(id: number): void {
    this.cardFromIDSubject.next(id);
  }

  clearCardDetails() {
    this.cardFromIDSubject.next(0);
    sessionStorage.removeItem('lastCardDetail');
  }

  updatePatchCard(card: CardListItem) {
    this.patchCardSubject.next(card);
  }

  clearPatchCard() {
    this.patchCardSubject.next(null);
    sessionStorage.removeItem('lastCardListItem');
  }
}
