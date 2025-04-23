import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlimpseStateService {
  // internals
  private errorMessageSubject = new BehaviorSubject<string>(
    'Default Error Message'
  );

  constructor() {}

  // Subject for passing the backend error message into the 404 page.
  getErrorMessageListener() {
    return this.errorMessageSubject.asObservable();
  }

  setErrorMessage(message: string) {
    this.errorMessageSubject.next(message);
  }
}
