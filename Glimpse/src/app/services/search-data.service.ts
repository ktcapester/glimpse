import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { BackendGlueService } from './backend-glue.service';
import { Router } from '@angular/router';
import { GlimpseStateService } from './glimpse-state.service';
import { filter, switchMap, tap } from 'rxjs/operators';
import { ErrorCode } from '../enums/error-code';

@Injectable({
  providedIn: 'root',
})
export class SearchDataService {
  private searchTermSubject = new BehaviorSubject<string>('');

  searchResults$ = this.searchTermSubject.pipe(
    filter((term) => !!term),
    switchMap((term) => {
        return this.glue.getCardSearch(term).pipe(
          tap((results) => {
            if (typeof results === 'string') {
              // error response
              if (results === ErrorCode.CARD_NOT_FOUND) {
                // go to no-results component
                this.router.navigate(['/none', term]);
              } else if (results === ErrorCode.CARD_AMBIGUOUS) {
                // go to suggestions component
                this.router.navigate(['/suggestions', term]);
              } else {
                this.router.navigate(['/404']);
              }
            } else {
              // successful response
              // aka response is CardSearch obj
              sessionStorage.setItem(
                'lastSearchedCard',
                JSON.stringify(results)
              );
            }
          })
        );
    })
  );

  constructor(
    private glue: BackendGlueService,
    private router: Router,
    private state: GlimpseStateService
  ) {}

  updateSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  clearSearchResults() {
    this.searchTermSubject.next('');
  }
}
