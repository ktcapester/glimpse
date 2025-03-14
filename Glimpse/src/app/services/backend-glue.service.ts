import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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

  private getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    return token
      ? { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }
      : {};
  }

  // This requests a magic link to be sent to the provided email.
  // It returns TRUE if the email is sent, FALSE if any error occurs.
  postMagicLink(email: string) {
    return this.http
      .post<{ message: string; success: boolean }>(
        `${this.apiUrl}/auth/magic-link`,
        { email }
      )
      .pipe(
        map((result) => {
          if (result.success) {
            return true;
          } else {
            return false;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 500) {
            return of(false);
          } else {
            return of(false);
          }
        })
      );
  }

  getVerifyToken(email: string, token: string) {
    return this.http
      .get<{ token: string }>(`${this.apiUrl}/auth/verify`, {
        params: { email, token },
      })
      .pipe(
        map((response) => {
          return { success: true, data: response.token };
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400) {
            return of({ success: false, data: 'invalid' }); // token and/or email missing/invalid
          }
          if (error.status === 500) {
            return of({ success: false, data: 'server error' }); // server error
          }
          return of({ success: false, data: 'unknown error' });
        })
      );
  }

  getCardSearch(cardName: string) {
    let params = new HttpParams().set('name', cardName);
    return this.http
      .get<CardDisplayOnly[]>(`${this.apiUrl}/search`, { params })
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
    return this.http.get<CardPrices>(`${this.apiUrl}/price`, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 500) {
          return of('A server error occurred. Try again later.');
        } else {
          return of('An unknown error occured.');
        }
      })
    );
  }

  getUser() {
    return this.http.get<{ email: string; username: string; lists: string[] }>(
      `${this.apiUrl}/user`,
      this.getAuthHeaders()
    );
  }

  getCardList(list_id: string) {
    return this.http.get<{ list: CardListItem[]; currentTotal: number }>(
      `${this.apiUrl}/list/${list_id}`,
      this.getAuthHeaders()
    );
  }

  postCardList(list_id: string, name: string, imgsrc: string, price: number) {
    return this.http.post<{ data: CardListItem; currentTotal: number }>(
      `${this.apiUrl}/list/${list_id}`,
      {
        name,
        imgsrc,
        price,
      },
      this.getAuthHeaders()
    );
  }

  deleteCardList(list_id: string) {
    return this.http.delete<{ list: CardListItem[]; currentTotal: number }>(
      `${this.apiUrl}/list/${list_id}`,
      this.getAuthHeaders()
    );
  }

  deleteSingleCard(list_id: string, card_id: string) {
    return this.http
      .delete<{ list: CardListItem[]; currentTotal: number }>(
        `${this.apiUrl}/list/${list_id}/cards/${card_id}`,
        this.getAuthHeaders()
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

  getCardDetails(list_id: string, card_id: string) {
    return this.http
      .get<CardListItem>(
        `${this.apiUrl}/list/${list_id}/cards/${card_id}`,
        this.getAuthHeaders()
      )
      .pipe(
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

  patchCardDetails(
    list_id: string,
    card_id: string,
    price: number,
    count: number
  ) {
    return this.http
      .patch<{ currentTotal: number }>(
        `${this.apiUrl}/list/${list_id}/cards/${card_id}`,
        {
          price,
          count,
        },
        this.getAuthHeaders()
      )
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
