import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  CardDisplayOnly,
  CardListItem,
  CardPrices,
} from '../interfaces/backend.interface';

@Injectable({
  providedIn: 'root',
})
export class BackendGlueService {
  /*
   * This service is a centralized location of all backend HTTP requests.
   * It catches network errors and enforces return types for use in other components.
   *
   */
  private apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  getCardSearch(cardName: string) {
    let params = new HttpParams().set('name', cardName);

    return this.http
      .get<CardDisplayOnly[]>(this.apiUrl + '/search', { params })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400) {
            return of('No search term provided!');
          } else if (error.status === 500) {
            return of('A server error occurred. Try again later.');
          } else {
            return of('An unknown error occured.');
          }
        })
      );
  }

  getPrices(cardName: string) {
    let params = new HttpParams().set('name', cardName);

    return this.http.get<CardPrices>(this.apiUrl + '/price', { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 500) {
          return of('A server error occurred. Try again later.');
        } else {
          return of('An unknown error occured.');
        }
      })
    );
  }

  getCardList() {
    return this.http.get<{ list: CardListItem[]; currentTotal: number }>(
      this.apiUrl + '/list'
    );
  }

  postCardList(name: string, imgsrc: string, price: number) {
    return this.http.post<{ data: CardListItem; currentTotal: number }>(
      this.apiUrl + '/list',
      {
        name,
        imgsrc,
        price,
      }
    );
  }

  deleteCardList() {
    return this.http.delete<{ list: CardListItem[]; currentTotal: number }>(
      this.apiUrl + '/list'
    );
  }

  deleteSingleCard(card_id: number) {
    // let params = new HttpParams().set('id', card_id);
    return this.http
      .delete<{ list: CardListItem[]; currentTotal: number }>(
        `${this.apiUrl}/list/${card_id}`
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.log('removing a card from list failed');
            return of(error.message);
          } else if (error.status === 500) {
            return of('A server error occurred. Try again later.');
          } else {
            return of('An unknown error occured.');
          }
        })
      );
  }

  getCardDetails(card_id: number) {
    // let params = new HttpParams().set('id', card_id);
    return this.http.get<CardListItem>(`${this.apiUrl}/list/${card_id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.log('getting a card from list failed');
          return of(error.message);
        } else if (error.status === 500) {
          return of('A server error occurred. Try again later.');
        } else {
          return of('An unknown error occured.');
        }
      })
    );
  }

  patchCardDetails(card: CardListItem) {
    // let params = new HttpParams().set('id', card.id);
    return this.http
      .patch<{ currentTotal: number }>(`${this.apiUrl}/list/${card.id}`, {
        card,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.log('updating card in list failed');
            return of(error.message);
          } else if (error.status === 500) {
            return of('A server error occurred. Try again later.');
          } else {
            return of('An unknown error occured.');
          }
        })
      );
  }
}
