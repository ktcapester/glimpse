import { effect, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { UserSchema } from '../interfaces/schemas.interface';
import { first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

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

  constructor() {
    // Whenever auth state changes, fetch or clear user
    effect(() => {
      if (this.auth.isLoggedIn()) {
        const raw = this.storage.getItem('user');
        let loaded = false;
        if (raw) {
          try {
            const u: UserSchema = JSON.parse(raw);
            this.userSignal.set(u);
            loaded = true;
          } catch {
            this.storage.removeItem('user');
          }
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
      const u = await this.http
        .get<UserSchema>(`${environment.apiURL}/user`, {
          withCredentials: true,
        })
        .pipe(first())
        .toPromise();
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
