import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storage = inject(StorageService);
  private http = inject(HttpClient);

  // Signal holding the current JWT (or null if not logged in)
  private tokenSignal = signal<string | null>(this.storage.getItem('jwtToken'));

  // Read-only access to the token
  readonly token = this.tokenSignal.asReadonly();

  // Computed boolean: true iff token exists
  readonly isLoggedIn = computed(() => !!this.token());

  constructor() {
    // Persist tokenSignal to StorageService whenever it changes
    effect(() => {
      const t = this.tokenSignal();
      if (t) {
        this.storage.setItem('jwtToken', t);
      } else {
        this.storage.removeItem('jwtToken');
      }
    });
  }

  // Call this after a successful login to store the new JWT
  setToken(token: string) {
    this.tokenSignal.set(token);
  }

  // Clear the access token (JWT)
  clearToken() {
    this.tokenSignal.set(null);
  }

  // Refresh the access token (JWT) when it expires
  async refreshToken(): Promise<void> {
    const resp = await firstValueFrom(
      this.http.post<{ accessToken: string }>(
        `${environment.apiURL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      )
    );
    this.setToken(resp.accessToken);
  }
}
