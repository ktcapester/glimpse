import { Injectable } from '@angular/core';
import { BackendGlueService } from './backend-glue.service';
import { UserSchema } from '../interfaces/schemas.interface';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private glue: BackendGlueService) {
    this.initUserLoad();
  }

  private userSubject = new BehaviorSubject<UserSchema | null>(null);
  user$ = this.userSubject.asObservable();
  private fetchTrigger = new BehaviorSubject<void>(undefined);

  private loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    console.log('got stored user:', storedUser);
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
      return true;
    }
    return false;
  }

  private initUserLoad() {
    // Set up fetching the User from the server using the JWT
    this.fetchTrigger
      .pipe(
        switchMap(() => {
          return this.glue.getUser().pipe(
            tap((user) => {
              if (typeof user == 'string') {
                console.log('not logged in:', user);
              } else {
                console.log('storing user:', user);
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
              }
            }),
            catchError((error) => {
              console.error('Error fetching user:', error);
              this.userSubject.next(null);
              return of(null);
            })
          );
        })
      )
      .subscribe();

    // Check localStorage for a cached User
    const success = this.loadUserFromStorage();
    if (!success) {
      // not in localStorage, so trigger the backend request
      console.log('trigger user fetch');
      this.fetchUser();
    }
    // if no user or JWT found, just do nothing...probably?
  }

  fetchUser() {
    this.fetchTrigger.next();
  }

  isTokenValid() {
    const token = localStorage.getItem('jwtToken');
    if (!token || this.isTokenExpired(token)) {
      return false;
    }
    return true;
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      return !decoded.exp || Date.now() / 1000 >= decoded.exp;
    } catch (error) {
      console.log('isTokenExpired() got an error:', error);
      return true;
    }
  }
}
