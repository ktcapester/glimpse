import { effect, inject, Injectable, signal } from '@angular/core';
import { UserService } from './user.service';
import { CardListService } from './card-list.service';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrentTotalService {
  private userService = inject(UserService);
  private listService = inject(CardListService);

  private _total = signal<number>(0);
  readonly total = this._total.asReadonly();

  constructor() {
    effect(() => {
      const user = this.userService.user();
      const listID = user?.activeList;

      if (listID) {
        // trigger the HTTP call, the interceptor will call setTotal() itself
        this.listService.getList(listID).pipe(take(1)).subscribe();
      } else {
        // reset total on logout
        this._total.set(0);
      }
    });
  }

  setTotal(value: number) {
    this._total.set(value);
  }
}
