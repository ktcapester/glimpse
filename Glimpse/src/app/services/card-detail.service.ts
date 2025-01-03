import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BackendGlueService } from './backend-glue.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { CardListItem } from '../interfaces/backend.interface';
import { SearchDataResults } from '../interfaces/search-data-results.interface';
import { ErrorCode } from '../enums/error-code';

@Injectable({
  providedIn: 'root',
})
export class CardDetailService {
  private cardFromIDSubject = new BehaviorSubject<number>(0);
  private patchCardSubject = new BehaviorSubject<CardListItem | null>(null);

  private deatilSearchTermSubject = new BehaviorSubject<string>('');

  // duplicated from search-data-service, but we "know" we should get a single card result
  detailSearchResults$ = this.deatilSearchTermSubject.pipe(
    filter((term) => !!term), // only query backend if there is a search term
    switchMap((term) => {
      return this.glue.getCardSearch(term).pipe(
        map((results) => {
          if (typeof results === 'string') {
            // error response
            if (results === ErrorCode.CARD_NOT_FOUND) {
              const noneResult: SearchDataResults = {
                cards: [],
                term: term,
                code: ErrorCode.CARD_NOT_FOUND,
                details: 'No cards found with that search term.',
              };
              return noneResult;
            } else {
              const stringResult: SearchDataResults = {
                cards: [],
                term: term,
                code: 'UNKNOWN_STRING',
                details:
                  'detailSearchResults$ got an unknown string back from the glue.',
              };
              return stringResult;
            }
          } else {
            // successful response
            // aka response is CardSearch[]
            if (results.length > 1) {
              // go to suggestions component
              const suggestResult: SearchDataResults = {
                cards: results,
                term: term,
                code: 'SUGGESTIONS',
                details: 'Multiple cards found with that search term.',
              };
              return suggestResult;
            }
            // only one card in list, so return that in preparation for the results page.
            const singleResult: SearchDataResults = {
              cards: results,
              term: term,
              code: 'SUCCESS',
              details: 'Found a matching card for the search term.',
            };
            return singleResult;
          }
        }),
        catchError((error) => {
          console.error('An unexpected error occurered:', error);
          const errorResult: SearchDataResults = {
            cards: [],
            term: term,
            code: 'UNEXPECTED',
            details:
              'catchError in detailSearchResults$ caught an unexpected error.',
          };
          return of(errorResult);
        })
      );
    })
  );

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

  updateSearchFromName(name: string) {
    this.deatilSearchTermSubject.next(name);
  }

  clearSearchName() {
    this.deatilSearchTermSubject.next('');
  }

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
