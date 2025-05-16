import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService, SearchResultService, AuthService } from '../services';
import { CardSchema, UserSchema } from '../interfaces';
import { EMPTY } from 'rxjs';

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

  listButtonText = signal('+ Add to List');

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
    // sanity check
    console.log('Adding', card._id, 'to list', user.activeList);
    // user is logged in, so we can use the DB
    this.resultService
      .addCard(card, user.activeList)
      .pipe(
        tap(() => {
          console.log('in the tap()');
          this.listFeedback();
        }),
        catchError((err) => {
          console.log('search-result-component onAddToList error:', err);
          this._isAdding.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  listFeedback() {
    console.log('listFeedback()');
    const prevText = this.listButtonText();
    this.listButtonText.set('Added to list!');
    // wait for a bit
    setTimeout(() => {
      try {
        console.log('Timeout in listFeedback()');
        this.listButtonText.set(prevText);
        this._isAdding.set(false);
      } catch (error) {
        console.log('Error in listFeedback:', error);
      }
    }, 500);
  }
}
