import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CardSchema } from '../interfaces/schemas.interface';
import { ListData } from '../interfaces/list-data';

interface BackendListItem {
  card: CardSchema;
  quantity: number;
}

interface BackendListData {
  list: BackendListItem[];
  currentTotal: number;
}

@Injectable({
  providedIn: 'root',
})
export class CardListService {
  private apiUrl = `${environment.apiURL}/list`;
  private http = inject(HttpClient);

  getList(listID: string): Observable<ListData> {
    return this.http.get<BackendListData>(`${this.apiUrl}/${listID}`).pipe(
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

  deleteList(listID: string) {
    return this.http.delete<BackendListData>(`${this.apiUrl}/${listID}`);
  }
}
