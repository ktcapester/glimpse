import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  UserService,
  CardSearchService,
  CurrentTotalService,
  CardSuggestionService,
} from '../services';
import { narrowEventToNavigationEnd } from '../type-guard.util';

@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule, CurrencyPipe, NgOptimizedImage],
  templateUrl: './search-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent implements OnInit {
  private cardSearch = inject(CardSearchService);
  private userSvc = inject(UserService);
  private totalSvc = inject(CurrentTotalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private suggestions = inject(CardSuggestionService);

  readonly user = this.userSvc.user;
  readonly total = this.totalSvc.total;
  readonly searchForm = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  @ViewChild('inputField') inputElement!: ElementRef;

  ngOnInit(): void {
    // Populate the search input with the term found in the URL.
    // "canonical pattern" is to subscribe to the router events,
    // then get the deepest active route, and look at its paramMap
    this.router.events
      .pipe(
        // whenever navigation ends:
        filter(narrowEventToNavigationEnd),
        // get the deepest ActivatedRoute
        map(() => {
          let route = this.route.root;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        // grab the paramMap from that child
        switchMap((route) =>
          route.paramMap.pipe(
            map((pm) => {
              // pull out the literal path segment (result/suggestions/none)
              const segment = route.snapshot.url[0].path;
              const term = pm.get('term') ?? '';
              // only repopulate on suggestions/none; clear on result
              return segment === 'result' ? '' : term;
            })
          )
        ),
        // only patch when the term actually changes
        distinctUntilChanged(),
        // new way to ensure subscription is auto-cleaned up
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((term) => {
        // update the value, but don't re-trigger submit logic
        this.searchForm.patchValue({ search: term }, { emitEvent: false });
      });
  }

  navigateToList() {
    const u = this.user();
    if (u?.activeList) {
      this.router.navigate(['/list']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  handleSubmit() {
    if (this.searchForm.invalid) {
      // do nothing so they stay on the page
      return;
    }

    // start a spinner?
    // make input lose focus
    this.inputElement.nativeElement.blur();
    // extract search term
    const word = this.searchForm.value.search?.trim();
    if (!word) {
      return;
    }
    // Use the input to search for a card.
    this.cardSearch.searchForCard(word).subscribe({
      next: (cards) => {
        if (cards.length > 1) {
          this.suggestions.updateSuggestions(cards);
          this.router.navigate(['/suggestions', word]);
        } else if (cards.length === 1) {
          this.router.navigate(['/result', cards[0].name]);
        } else {
          this.router.navigate(['/none', word]);
        }
      },
      error: () => {
        this.router.navigate(['/404']);
      },
    });
    // since this subscription is on a HttpClient Observable,
    // it will complete and clean up on its own.
  }
}
