import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerifyService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

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
        this.http.get<{ token: string }>(`${environment.apiURL}/auth/verify`, {
          params: { email, token },
        })
      );
      // Store the token via StorageService
      this.storage.setItem('jwtToken', resp.token);
      // Update signals with successful response
      this._response.set(true);
      this._success.set(true);
    } catch (error) {
      console.error('validateToken error:', error);
      // We got an error from the http call (maybe something else too)
      // Clear the stored jwtToken because it is invalid
      this.storage.removeItem('jwtToken');
      // Update the signals with the response came back but was failure
      this._response.set(true);
      this._success.set(false);
    }
  }
}
