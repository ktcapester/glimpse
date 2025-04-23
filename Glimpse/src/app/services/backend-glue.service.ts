import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CardDisplayOnly } from '../interfaces/backend.interface';

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
}
