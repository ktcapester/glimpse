import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CardListItem, CardSearch } from '../interfaces/backend.interface';
import { ErrorCode } from '../enums/error-code';

@Injectable({
  providedIn: 'root',
})
export class BackendGlueService {
  private apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  getCardSearch(cardName: string) {
    let params = new HttpParams().set('name', cardName);

    return this.http.get<CardSearch>(this.apiUrl + '/search', { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          const errorCode = error.error?.errorCode;
          if (errorCode === ErrorCode.CARD_AMBIGUOUS) {
            return of('Too many cards found');
          } else if (errorCode === ErrorCode.CARD_NOT_FOUND) {
            return of('No card found.');
          } else {
            return of('Unknown 404 error');
          }
        } else if (error.status === 500) {
          return of('A server error occurred. Try again later.');
        } else {
          return of('An unknown error occured.');
        }
      })
    );
  }

  getCardList() {
    return this.http.get<CardListItem[]>(this.apiUrl + '/list');
  }

  postCardList(card: { name: string; price: number }) {
    return this.http.post(this.apiUrl + '/list', { card });
  }
}
