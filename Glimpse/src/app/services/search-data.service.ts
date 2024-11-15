import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BackendGlueService } from './backend-glue.service';
import { Router } from '@angular/router';
import { GlimpseStateService } from './glimpse-state.service';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
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
        map((results) => {
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
            throw new Error('Error response encountered');
          } else {
            // successful response
            // aka response is CardSearch obj
            return results;
          }
        }),
        catchError((error) => {
          console.error('An unexpected error occurered:', error);
          this.router.navigate(['/404']);
          return [];
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

  initTotal() {
    this.glue
      .getCardList()
      .pipe(
        take(1), // only need to get value once, then complete please.
        tap((results) => {
          console.log('hello?');
          console.log(results);
          this.state.pushNewTotal(results.currentTotal);
        })
      )
      .subscribe();
  }
}
