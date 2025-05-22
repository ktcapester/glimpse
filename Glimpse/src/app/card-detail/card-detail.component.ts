import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { CardDetailService, UserService } from '../services';
import { CardSchema } from '../interfaces';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { isDefined } from '../type-guard.util';
import { CardDisplayComponent } from '../card-display/card-display.component';

interface DetailView {
  card: CardSchema;
  quantity: number;
  listID: string;
}

@Component({
  selector: 'app-card-detail',
  imports: [CommonModule, CardDisplayComponent],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private details = inject(CardDetailService);
  private userService = inject(UserService);

  private patching = signal(false);
  readonly isPatching = this.patching.asReadonly();

  // Use the URL and the current User to get the details we need.
  private cardID$ = this.route.paramMap.pipe(
    map((pm) => pm.get('cardID')),
    filter(isDefined),
    distinctUntilChanged()
  );
  readonly viewDetails = toSignal<DetailView | null>(
    this.cardID$.pipe(
      switchMap((cardID) =>
        this.userService.user$.pipe(
          filter(isDefined),
          switchMap((user) =>
            this.details.getCard(user.activeList, cardID).pipe(
              map((data) => ({ ...data, listID: user.activeList })),
              catchError((err) => {
                console.error('card load failed', err);
                return of(null);
              })
            )
          )
        )
      )
    ),
    { initialValue: null }
  );

  disabler = computed(() => {
    const view = this.viewDetails();
    if (!view) return true;
    return this.patching() || view.quantity >= 99 || view.quantity === 1;
  });

  updateCount(
    detail: { card: CardSchema; quantity: number; listID: string },
    delta: number
  ) {
    const newCount = detail.quantity + delta;
    if (newCount < 1 || newCount > 99) return;
    this.patching.set(true);
    this.details
      .updateCard(
        detail.listID,
        detail.card._id,
        detail.card.prices?.calc?.usd ?? 0,
        newCount
      )
      .pipe(finalize(() => this.patching.set(false)))
      .subscribe();
  }

  onItemRemove(detail: { card: CardSchema; quantity: number; listID: string }) {
    this.patching.set(true);
    this.details
      .deleteCard(detail.listID, detail.card._id)
      .pipe(
        tap(() => this.router.navigate(['/list'])),
        finalize(() => this.patching.set(false))
      )
      .subscribe();
  }
}
