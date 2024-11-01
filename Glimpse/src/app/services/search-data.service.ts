import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { BackendGlueService } from './backend-glue.service';
import { Router } from '@angular/router';
import { GlimpseStateService } from './glimpse-state.service';
import { filter, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SearchDataService {
  private searchTermSubject = new BehaviorSubject<string>('');

  searchResults$ = this.searchTermSubject.pipe(
    filter((term) => !!term),
    switchMap((term) => {
      const storedData = sessionStorage.getItem('lastSearchedCard');
      if (storedData && term === JSON.parse(storedData).name) {
        return of(JSON.parse(storedData));
      } else {
        return this.glue.getCardSearch(term).pipe(
          tap((results) => {
            if (typeof results === 'string') {
              // error response
              this.state.setErrorMessage(results);
              this.router.navigate(['/404']);
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
      }
    })
  );

  constructor(
    private glue: BackendGlueService,
    private router: Router,
    private state: GlimpseStateService
  ) {
    const storedResults = sessionStorage.getItem('lastSearchedCard');
    if (storedResults) {
      this.searchTermSubject.next(JSON.parse(storedResults).name);
    }
  }

  updateSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  clearSearchResults() {
    this.searchTermSubject.next('');
    sessionStorage.removeItem('lastSearchedCard');
  }
}
