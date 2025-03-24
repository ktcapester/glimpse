import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BackendGlueService } from './backend-glue.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { CardListItem } from '../interfaces/backend.interface';
import { SearchDataResults } from '../interfaces/search-data-results.interface';

@Injectable({
  providedIn: 'root',
})
export class CardDetailService {
  private cardFromIDSubject = new BehaviorSubject<{
    listID: string;
    cardID: string;
  } | null>(null);
  private patchCardSubject = new BehaviorSubject<{
    listID: string;
    cli: CardListItem;
  } | null>(null);

  private detailSearchTermSubject = new BehaviorSubject<string>('');

  // duplicated from search-data-service, but we "know" we should get a single card result
  detailSearchResults$ = this.detailSearchTermSubject.pipe(
    filter((term) => !!term), // only query backend if there is a search term
    switchMap((term) => {
      return this.glue.getCardSearch(term).pipe(
        map((results) => {
          if (typeof results === 'string') {
            // error response
            const stringResult: SearchDataResults = {
              cards: [],
              term: term,
              code: 'ERROR',
              details:
                'detailSearchResults$ got an unknown string back from the glue.',
            };
            return stringResult;
          } else {
            // successful response
            // aka response is CardSearch[]
            if (results.length === 0) {
              const noneResult: SearchDataResults = {
                cards: [],
                term: term,
                code: 'ZERO',
                details: 'No cards found with that search term.',
              };
              return noneResult;
            } else if (results.length > 1) {
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
            code: 'ERROR',
            details:
              'catchError in detailSearchResults$ caught an unexpected error.',
          };
          return of(errorResult);
        })
      );
    })
  );

  cardFromID$ = this.cardFromIDSubject.pipe(
    filter((deets) => !!deets),
    switchMap((deets) => {
      return this.glue.getCardDetails(deets.listID, deets.cardID).pipe(
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
      (deets): deets is { listID: string; cli: CardListItem } => deets !== null
    ),
    switchMap((deets) => {
      return this.glue
        .patchCardDetails(
          deets.listID,
          deets.cli.id,
          deets.cli.price,
          deets.cli.count
        )
        .pipe(
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
    this.detailSearchTermSubject.next(name);
  }

  clearSearchName() {
    this.detailSearchTermSubject.next('');
  }

  updateDetailFromID(listId: string, cardId: string): void {
    this.cardFromIDSubject.next({ listID: listId, cardID: cardId });
  }

  clearCardDetails() {
    this.cardFromIDSubject.next(null);
  }

  updatePatchCard(activeListID: string, card: CardListItem) {
    this.patchCardSubject.next({ listID: activeListID, cli: card });
  }

  clearPatchCard() {
    this.patchCardSubject.next(null);
  }
}
