import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storage = inject(StorageService);
  // Signal holding the current JWT (or null if not logged in)
  private tokenSignal = signal<string | null>(this.storage.getItem('jwtToken'));

  // Read-only access to the token
  readonly token = this.tokenSignal.asReadonly();

  // Computed boolean: true if token exists and is not expired
  readonly isLoggedIn = computed(() => {
    const t = this.tokenSignal();
    if (!t) return false;
    try {
      const { exp } = jwtDecode<{ exp?: number }>(t);
      return !!exp && Date.now() / 1000 < exp;
    } catch {
      return false;
    }
  });

  constructor(private http: HttpClient) {
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

  // Clear the JWT (e.g. on logout or 401)
  clearToken() {
    this.tokenSignal.set(null);
  }

  // Optionally refresh the token from the server
  async refreshToken() {
    const resp = await firstValueFrom(
      this.http.post<{ token: string }>(
        `${environment.apiURL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
    );
    this.setToken(resp.token);
  }
}
