import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { UserService, SearchResultService, AuthService } from '../services';
import { CardSchema, UserSchema } from '../interfaces';

@Component({
  selector: 'app-search-result',
  imports: [CurrencyPipe, CommonModule, NgOptimizedImage],
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'component-container' },
})
export class SearchResultComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private resultService = inject(SearchResultService);
  private authService = inject(AuthService);

  listButtonText = '+ Add to List';

  readonly card = toSignal(
    // Get the card data each time the route changes
    this.route.paramMap.pipe(
      map((pm) => pm.get('cardName')!),
      switchMap((cardName) => this.resultService.getCard(cardName))
    ),
    { initialValue: null }
  );

  // Get the user from the service
  readonly user = this.userService.user;

  private _isAdding = signal(false);
  readonly isAdding = this._isAdding.asReadonly();

  onAddToList(card: CardSchema, user: UserSchema | null) {
    // check if user is logged in & redirect if needed
    if (!user || !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this._isAdding.set(true);
    // user is logged in, so we can use the DB
    this.resultService
      .addCard(card, user.activeList)
      .pipe(
        tap(() => {
          this.listFeedback();
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  listFeedback() {
    const prevText = this.listButtonText;
    this.listButtonText = 'Added to list!';
    // wait for a bit
    setTimeout(
      () => ((this.listButtonText = prevText), this._isAdding.set(false)),
      500
    );
  }
}
