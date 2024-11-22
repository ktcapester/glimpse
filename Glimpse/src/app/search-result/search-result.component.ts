import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { SearchDataService } from '../services/search-data.service';
import { BackendGlueService } from '../services/backend-glue.service';
import { CardSuggestionService } from '../services/card-suggestion.service';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [HeaderComponent, CurrencyPipe, CommonModule],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css',
})
export class SearchResultComponent implements OnInit, OnDestroy {
  displayCard!: DisplayCard;
  private destroy$ = new Subject<void>();
  listButtonText = '+ Add to List';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private state: GlimpseStateService,
    private searchdata: SearchDataService,
    private glue: BackendGlueService,
    private suggests: CardSuggestionService
  ) {}

  ngOnDestroy(): void {
    console.log('SearchResult ngOnDestroy called!', Date.now());
    this.searchdata.clearSearchResults(); // turned on due to leaving the page i guess?
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    console.log('SearchResult ngOnInit called!', Date.now());
    // Set up getting names out of the URL
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        tap((params) => {
          const name = params.get('cardName') || '';
          this.searchdata.updateSearchTerm(name);
        })
      )
      .subscribe();

    this.searchdata.searchResults$
      .pipe(
        takeUntil(this.destroy$),
        tap((card) => {
          if (card) {
            if (Array.isArray(card)) {
              this.suggests.updateSuggestions(card);
              this.router.navigate(['/suggestions']);
            } else {
              this.setDisplayCard(card);
              this.router.navigate(['/result', card.name]);
            }
          } else {
            // card was null
            this.state.setErrorMessage('Trouble with searchResults$');
            this.router.navigate(['/404']);
          }
        })
      )
      .subscribe();
  }

  private setDisplayCard(card: any): void {
    this.displayCard = {
      name: card.name,
      imgsrc: card.imgsrc,
      foilprice: card.usd_foil,
      normalprice: card.usd,
      etchedprice: card.usd_etched,
      scryfallLink: card.scryfallLink,
    };
  }

  onAddToList() {
    // use backend to add to the list
    // Note: the observable from http.post must be subscribed to in order to actually run!
    this.glue
      .postCardList({
        name: this.displayCard.name,
        price: this.displayCard.normalprice,
      })
      .pipe(
        takeUntil(this.destroy$),
        tap((list_response) => {
          if (list_response.data.name === this.displayCard.name) {
            this.state.pushNewTotal(list_response.currentTotal);
            this.listFeedback();
          } else {
            console.log('Something went wrong.');
            console.log(list_response);
          }
        })
      )
      .subscribe();
  }

  async listFeedback() {
    const prevText = this.listButtonText;
    this.listButtonText = 'Added to list!';
    // wait for a bit
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.listButtonText = prevText;
  }

  onGoToScryfall() {
    window.open(this.displayCard.scryfallLink, '_blank');
  }
}
