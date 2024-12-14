import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { BackendGlueService } from './backend-glue.service';
import { GlimpseStateService } from './glimpse-state.service';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { ErrorCode } from '../enums/error-code';
import { CardSuggestionService } from './card-suggestion.service';
import { SearchDataResults } from '../interfaces/search-data-results.interface';

@Injectable({
  providedIn: 'root',
})
export class SearchDataService {
  private searchTermSubject = new BehaviorSubject<string>('');

  // This takes the search term from the input & gets stuff from the backend glue
  // It will pass along data to describe what the result from the glue was
  // Allowing the components to handle all the navigation themselves.
  searchResults$ = this.searchTermSubject.pipe(
    filter((term) => !!term), // only query backend if there is a search term
    switchMap((term) => {
      return this.glue.getCardSearch(term).pipe(
        map((results) => {
          console.log('search-data-service:', results);
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
                  'searchResults$ got an unknown string back from the glue.',
              };
              return stringResult;
            }
          } else {
            console.log('success response:', results);
            // successful response
            // aka response is CardSearch[]
            if (results.length > 1) {
              // go to suggestions component
              this.suggests.updateSuggestions(results);
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
            details: 'catchError in searchResults$ caught an unexpected error.',
          };
          return of(errorResult);
        })
      );
    })
  );

  constructor(
    private glue: BackendGlueService,
    private state: GlimpseStateService,
    private suggests: CardSuggestionService
  ) {}

  updateSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  clearSearchResults() {
    this.searchTermSubject.next('');
  }

  initTotal() {
    this.glue
      .getCardList()
      .pipe(
        take(1), // only need to get value once, then complete please.
        tap((results) => {
          this.state.pushNewTotal(results.currentTotal);
        })
      )
      .subscribe();
  }
}
