import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  catchError,
  distinctUntilChanged,
  exhaustMap,
  filter,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { CardDetailService, UserService } from '../services';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, of } from 'rxjs';
import { isDefined } from '../type-guard.util';
import { CardDisplayComponent } from '../card-display/card-display.component';
import { AdsenseAdComponent } from '../adsense-ad/adsense-ad.component';

@Component({
  selector: 'app-card-detail',
  imports: [CardDisplayComponent, AdsenseAdComponent],
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private details = inject(CardDetailService);
  private userService = inject(UserService);

  private patching = signal(false);
  readonly isPatching = this.patching.asReadonly();

  private readonly listId = computed(
    () => this.userService.user()?.activeList ?? ''
  );

  // Use the URL to get the cardID param
  private cardID$ = this.route.paramMap.pipe(
    map((pm) => pm.get('cardID')),
    filter(isDefined),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Combine listID and cardID to get the card details
  private readonly cardResult$ = combineLatest({
    listID: toObservable(this.listId),
    cardID: this.cardID$,
  }).pipe(
    filter(({ listID, cardID }) => !!listID && !!cardID),
    switchMap(({ listID, cardID }) =>
      this.details.getCard(listID, cardID).pipe(
        catchError((err) => {
          console.error('Failed loading card details', err);
          return of<null>(null);
        })
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Signals for UI updates
  readonly cardDetail = toSignal(this.cardResult$, { initialValue: null });
  readonly card = computed(() => this.cardDetail()?.card ?? null);
  readonly quantity = signal(0);
  readonly disablerIncrement = computed(() => {
    const view = this.cardDetail();
    if (!view) return true;
    return this.patching() || this.quantity() >= 99;
  });
  readonly disablerDecrement = computed(() => {
    const view = this.cardDetail();
    if (!view) return true;
    return this.patching() || this.quantity() === 1;
  });

  // Signal to safely process clicks. {delta} makes each click a new event
  // even if delta is the same value.
  private readonly updateClicks = signal<{ delta: number } | null>(null);
  private readonly updateClicks$ = toObservable(this.updateClicks);

  constructor() {
    // Initialize the quantity signal based on the card details
    effect(() => {
      const result = this.cardDetail();
      this.quantity.set(result?.quantity ?? 0);
    });

    // Define click event handler, using onCleanup to unsubscribe
    effect((onCleanup) => {
      const sub = this.updateClicks$
        .pipe(
          filter(isDefined),
          exhaustMap(({ delta }) => {
            const listID = this.listId();
            const c = this.card();
            if (!listID || !c) return of<void>(undefined);

            this.patching.set(true);
            const newQty = Math.max(1, Math.min(99, this.quantity() + delta));

            return this.details
              .updateCard(listID, c._id, c.prices?.calc?.usd ?? 0, newQty)
              .pipe(
                tap(() => this.quantity.set(newQty)),
                catchError((err) => {
                  console.log('Update failed', err);
                  return of<void>(undefined);
                }),
                finalize(() => this.patching.set(false))
              );
          })
        )
        .subscribe();
      onCleanup(() => sub.unsubscribe());
    });
  }

  // Button callbacks
  increment() {
    this.updateClicks.set({ delta: 1 });
  }
  decrement() {
    this.updateClicks.set({ delta: -1 });
  }
  remove() {
    const listID = this.listId();
    const c = this.card();
    if (!listID || !c) return;

    this.patching.set(true);
    this.details
      .deleteCard(listID, c._id)
      .pipe(
        tap(() => this.router.navigate(['/list'])),
        finalize(() => this.patching.set(false))
      )
      .subscribe();
  }
}
