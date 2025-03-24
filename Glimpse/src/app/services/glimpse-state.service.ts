import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { BackendGlueService } from './backend-glue.service';

@Injectable({
  providedIn: 'root',
})
export class GlimpseStateService {
  // internals
  private currentTotalSubject = new BehaviorSubject<number>(0);
  private errorMessageSubject = new BehaviorSubject<string>(
    'Default Error Message'
  );

  constructor(private glue: BackendGlueService) {}

  // Subject for updating the current total price of the list
  getCurrentTotalListener() {
    return this.currentTotalSubject.asObservable();
  }

  pushNewTotal(total: number) {
    this.currentTotalSubject.next(total);
  }

  initTotal(listID: string) {
    this.glue
      .getCardList(listID)
      .pipe(
        take(1), // only need to get value once, then complete please.
        tap((results) => {
          this.pushNewTotal(results.currentTotal);
        })
      )
      .subscribe();
  }

  // Subject for passing the backend error message into the 404 page.
  getErrorMessageListener() {
    return this.errorMessageSubject.asObservable();
  }

  setErrorMessage(message: string) {
    this.errorMessageSubject.next(message);
  }
}
