import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendGlueService } from '../services/backend-glue.service';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CardSuggestionService } from '../services/card-suggestion.service';
import { CardDisplayOnly } from '../interfaces/backend.interface';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  templateUrl: './suggestions.component.html',
  styleUrl: './suggestions.component.css',
})
export class SuggestionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  displayList: CardDisplayOnly[] = [];
  card_height = 204;
  card_width = 146;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private glue: BackendGlueService,
    private suggests: CardSuggestionService
  ) {}

  ngOnDestroy(): void {
    console.log('SuggestionsComponent ngOnDestroy called!', Date.now());
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    console.log('SuggestionsComponent ngOnInit called!', Date.now());
    // Set up getting names out of the URL
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        tap((params) => {
          const term = params.get('term') || '';
        })
      )
      .subscribe();

    this.suggests
      .getCurrentSuggestionsListener()
      .pipe(
        takeUntil(this.destroy$),
        tap((cards) => {
          console.log(cards);
          this.displayList = cards;
        })
      )
      .subscribe();
  }

  cardOnClick(card: CardDisplayOnly) {
    console.log('you clicked on a card!', card);
  }
}
