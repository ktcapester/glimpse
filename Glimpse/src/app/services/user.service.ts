import { effect, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { UserSchema } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private storage = inject(StorageService);

  // Signal holding the current User data
  private userSignal = signal<UserSchema | null>(null);
  readonly user = this.userSignal.asReadonly();
  readonly user$ = toObservable(this.userSignal);

  private tryReviveUserFromCache(): UserSchema | null {
    const raw = this.storage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw, (key, value) => {
        if (key === 'createdAt') {
          return new Date(value as string);
        }
        return value;
      });
    } catch {
      this.storage.removeItem('user');
      return null;
    }
  }

  constructor() {
    // Whenever auth state changes, fetch or clear user
    effect(() => {
      if (this.auth.isLoggedIn()) {
        const loadedUser = this.tryReviveUserFromCache();
        let loaded = false;
        if (loadedUser) {
          this.userSignal.set(loadedUser);
          loaded = true;
        }
        // if no cached User, fetch from backend
        if (!loaded) {
          this.fetchAndCacheUser();
        }
      } else {
        // clear on logout or expired token
        this.userSignal.set(null);
        this.storage.removeItem('user');
      }
    });
  }

  private async fetchAndCacheUser() {
    try {
      const u = await firstValueFrom(
        this.http.get<UserSchema>(`${environment.apiURL}/user`, {
          withCredentials: true,
        })
      );
      this.storage.setItem('user', JSON.stringify(u));
      this.userSignal.set(u);
    } catch {
      this.userSignal.set(null);
      this.storage.removeItem('user');
    }
  }

  // Manually refresh profile when needed
  refresh() {
    if (this.auth.isLoggedIn()) {
      this.fetchAndCacheUser();
    }
  }
}
