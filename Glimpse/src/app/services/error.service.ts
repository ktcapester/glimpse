import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  // internals
  private _message = signal<string>('Default Error Message');
  readonly errorMessage = this._message.asReadonly();

  setErrorMessage(message: string) {
    this._message.set(message);
  }
}
