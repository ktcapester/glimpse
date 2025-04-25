import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { CardSchema, UserSchema } from '../interfaces/schemas.interface';
import { SearchResultService } from '../services/search-result.service';
import { AuthService } from '../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-result',
  imports: [CurrencyPipe, CommonModule],
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

  // Get the card data each time the route changes
  readonly card$ = this.route.paramMap.pipe(
    map((pm) => pm.get('cardName')!),
    switchMap((cardName) => this.resultService.getCard(cardName)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Combine the card & user streams to set the viewModel via async pipe
  readonly viewModel$ = combineLatest([
    this.card$,
    this.userService.user$, // get user observable from the service
  ]).pipe(
    map(([card, user]) => {
      return { card, user };
    })
  );

  onAddToList(card: CardSchema, user: UserSchema | null) {
    // check if user is logged in & redirect if needed
    if (!user || !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

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

  async listFeedback() {
    const prevText = this.listButtonText;
    this.listButtonText = 'Added to list!';
    // wait for a bit
    setTimeout(() => (this.listButtonText = prevText), 500);
  }
}
