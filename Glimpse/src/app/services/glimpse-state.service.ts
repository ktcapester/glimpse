import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlimpseStateService {
  // internals
  private currentTotalSubject = new BehaviorSubject<number>(0);
  private errorMessageSubject = new BehaviorSubject<string>(
    'Default Error Message'
  );

  constructor() {}

  // Subject for updating the current total price of the list
  getCurrentTotalListener() {
    return this.currentTotalSubject.asObservable();
  }

  pushNewTotal(total: number) {
    this.currentTotalSubject.next(total);
  }

  // Subject for passing the backend error message into the 404 page.
  getErrorMessageListener() {
    return this.errorMessageSubject.asObservable();
  }

  setErrorMessage(message: string) {
    this.errorMessageSubject.next(message);
  }
}
