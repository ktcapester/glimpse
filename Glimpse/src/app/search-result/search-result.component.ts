import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { BackendGlueService } from '../services/backend-glue.service';
import { SearchDataService } from '../services/search-data.service';

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
  private myCardName = '';

  constructor(
    private route: ActivatedRoute,
    private state: GlimpseStateService,
    private glue: BackendGlueService,
    private search: SearchDataService
  ) {}

  ngOnDestroy(): void {
    console.log('SearchResult ngOnDestroy called!', Date.now());
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
          this.myCardName = name;

          combineLatest([
            this.search.searchResults$,
            this.glue.getPrices(this.myCardName),
          ])
            .pipe(
              takeUntil(this.destroy$),
              tap(([searchResult, prices]) => {
                if (typeof prices !== 'string') {
                  const display: DisplayCard = {
                    name: searchResult.cards[0].name,
                    imgsrc: searchResult.cards[0].imgsrc,
                    normalprice: prices.usd,
                    foilprice: prices.usd_foil,
                    etchedprice: prices.usd_etched,
                    scryfallLink: searchResult.cards[0].scryfall,
                  };
                  this.displayCard = display;
                } else {
                  console.log('There was an error in prices but who cares');
                }
              })
            )
            .subscribe();
        })
      )
      .subscribe();
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
