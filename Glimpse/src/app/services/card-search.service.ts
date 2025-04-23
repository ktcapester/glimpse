import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CardDisplayOnly } from '../interfaces/backend.interface';

@Injectable({
  providedIn: 'root',
})
export class CardSearchService {
  private apiUrl = `${environment.apiURL}`;

  constructor(private http: HttpClient) {}

  searchForCard(searchTerm: string): Observable<CardDisplayOnly[]> {
    // takes the user's search term and looks for it
    // returns: array of CardDisplayOnly,
    // length==1 for exact match, len==6 for ambiguous, len==0 for none
    let params = new HttpParams().set('name', searchTerm);
    return this.http.get<CardDisplayOnly[]>(`${this.apiUrl}/search`, {
      params,
    });
  }
}
