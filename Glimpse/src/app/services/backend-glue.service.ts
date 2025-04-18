import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CardDisplayOnly, CardListItem } from '../interfaces/backend.interface';
import { Prices } from '../interfaces/prices.interface';
import { UserSchema } from '../interfaces/schemas.interface';

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

  // This requests a magic link to be sent to the provided email.
  // It returns TRUE if the email is sent, FALSE if any error occurs.
  postMagicLink(email: string) {
    return this.http
      .post<{ success: boolean }>(`${this.apiUrl}/auth/magic-link`, { email })
      .pipe(map((result) => result.success));
  }

  getVerifyToken(email: string, token: string) {
    console.log(`getVerifyToken with: ${email} and ${token}`);

    return this.http
      .get<{ token: string }>(`${this.apiUrl}/auth/verify`, {
        params: { email, token },
      })
      .pipe(
        map((response) => {
          return { success: true, data: response.token };
        })
      );
  }

  getCardSearch(cardName: string) {
    let params = new HttpParams().set('name', cardName);
    return this.http.get<CardDisplayOnly[]>(`${this.apiUrl}/search`, {
      params,
    });
  }

  getPrices(cardName: string) {
    let params = new HttpParams().set('name', cardName);
    return this.http.get<Prices>(`${this.apiUrl}/price`, { params });
  }

  getUser() {
    console.log('glue.getUser called');
    return this.http.get<UserSchema>(`${this.apiUrl}/user`);
  }

  postCardList(list_id: string, name: string, imgsrc: string, price: number) {
    return this.http.post<{ data: CardListItem; currentTotal: number }>(
      `${this.apiUrl}/list/${list_id}`,
      {
        name,
        imgsrc,
        price,
      }
    );
  }
}
