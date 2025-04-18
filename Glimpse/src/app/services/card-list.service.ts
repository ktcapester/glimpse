import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CardSchema } from '../interfaces/schemas.interface';
import { ListData } from '../interfaces/list-data';

@Injectable({
  providedIn: 'root',
})
export class CardListService {
  private apiUrl = `${environment.apiURL}/list`;

  constructor(private http: HttpClient) {}

  getList(listID: string): Observable<ListData> {
    return this.http
      .get<{
        list: { card: CardSchema; quantity: number }[];
        currentTotal: number;
      }>(`${this.apiUrl}/${listID}`)
      .pipe(
        map((response) => {
          const simpleList = response.list.map((entry) => {
            return {
              id: entry.card._id,
              name: entry.card.name,
              price: entry.card.prices?.calc?.usd || 0,
              count: entry.quantity,
            };
          });
          return { list: simpleList, currentTotal: response.currentTotal };
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
        // catchError here keeps the async pipe in card-list-component alive
        // the global interceptor is used for global reactions like 404 redirects
        catchError(() =>
          of({
            list: [],
            currentTotal: 0,
          })
        )
      );
  }

  deleteList(listID: string): Observable<number> {
    return this.http
      .delete<{
        list: { card: CardSchema; quantity: number }[];
        currentTotal: number;
      }>(`${this.apiUrl}/${listID}`)
      .pipe(map((v) => v.currentTotal));
  }
}
