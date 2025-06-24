import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { CardDisplayOnly } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class CardSearchService {
  private http = inject(HttpClient);

  searchForCard(searchTerm: string): Observable<CardDisplayOnly[]> {
    // takes the user's search term and looks for it
    // returns: array of CardDisplayOnly,
    // length==1 for exact match, len==6 for ambiguous, len==0 for none
    return this.http
      .get<CardDisplayOnly[]>(`${environment.apiURL}/search`, {
        params: new HttpParams().set('name', searchTerm),
      })
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}
