import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerifyService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // Create a signal to tell VerifyComponent when the http call is finished
  private _response = signal<boolean>(false);
  // Expose it as read only, so nobody else can update it
  readonly response = this._response.asReadonly();

  // Create a signal to tell VerifyComponent if the verification was a success
  private _success = signal<boolean>(false);
  // Expose it as read only, so nobody else can update it
  readonly success = this._success.asReadonly();

  async validateToken(email: string, token: string) {
    // Immediately invalidate signals when starting a new validation
    this._response.set(false);
    this._success.set(false);
    try {
      // Wait for the backend to return with a token
      const resp = await firstValueFrom(
        this.http.post<{ accessToken: string }>(
          `${environment.apiURL}/auth/verify`,
          {},
          {
            params: { email, token },
            withCredentials: true,
          }
        )
      );
      // Store the token via AuthService
      this.auth.setToken(resp.accessToken);
      // Update signal with successful response
      this._success.set(true);
    } catch (error) {
      console.error('validateToken error:', error);
      // We got an error from the http call (maybe something else too)
      // Clear the stored jwtToken because it is invalid
      this.auth.clearToken();
      // Update the signals with the response came back but was failure
      this._success.set(false);
    } finally {
      // Set the response signal to true, so the component can stop loading
      this._response.set(true);
    }
  }
}
