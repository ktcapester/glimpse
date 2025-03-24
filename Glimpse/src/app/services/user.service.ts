import { Injectable } from '@angular/core';
import { BackendGlueService } from './backend-glue.service';
import { UserSchema } from '../interfaces/schemas.interface';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

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
              localStorage.setItem('user', JSON.stringify(user));
              this.userSubject.next(user);
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
      this.fetchUser();
    }
    // if no user or JWT found, just do nothing...probably?
  }

  fetchUser() {
    this.fetchTrigger.next();
  }
}
