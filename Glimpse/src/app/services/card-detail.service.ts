import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CardSchema } from '../interfaces/schemas.interface';

@Injectable({
  providedIn: 'root',
})
export class CardDetailService {
  private apiUrl = `${environment.apiURL}/list`;
  private http = inject(HttpClient);

  getCard(
    listId: string,
    cardId: string
  ): Observable<{ card: CardSchema; quantity: number }> {
    return this.http
      .get<{ card: CardSchema; quantity: number }>(
        `${this.apiUrl}/${listId}/cards/${cardId}`
      )
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
        // catchError here keeps the async pipe in card-detail-component alive
        // the global interceptor is used for global reactions like 404 redirects
        catchError(() => of({ card: {} as CardSchema, quantity: 0 }))
      );
  }

  updateCard(listId: string, cardId: string, price: number, count: number) {
    return this.http.patch<{ currentTotal: number }>(
      `${this.apiUrl}/${listId}/cards/${cardId}`,
      {
        price,
        count,
      }
    );
  }

  deleteCard(listId: string, cardId: string) {
    return this.http.delete<{ currentTotal: number }>(
      `${this.apiUrl}/${listId}/cards/${cardId}`
    );
  }
}
