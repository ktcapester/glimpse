import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CurrentTotalService {
  private _total = signal<number>(0);

  readonly total = this._total.asReadonly();

  setTotal(value: number) {
    this._total.set(value);
  }
}
