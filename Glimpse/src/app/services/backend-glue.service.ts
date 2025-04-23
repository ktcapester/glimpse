import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
}
