import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { BackendGlueService } from '../services/backend-glue.service';
import { SearchDataService } from '../services/search-data.service';
import { ResultPricesService } from '../services/result-prices.service';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../services/user.service';
import { UserSchema } from '../interfaces/schemas.interface';

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
  myUser!: UserSchema;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private state: GlimpseStateService,
    private glue: BackendGlueService,
    private search: SearchDataService,
    private prices: ResultPricesService,
    private userService: UserService
  ) {}

  ngOnDestroy(): void {
    console.log('SearchResult ngOnDestroy called!', Date.now());
    this.prices.clearPrices();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    console.log('SearchResult ngOnInit called!', Date.now());

    this.userService.user$
      .pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          if (data) {
            this.myUser = data;
          }
        })
      )
      .subscribe();

    // Set up getting names out of the URL
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        tap((params) => {
          const name = params.get('cardName') || '';
          this.myCardName = name;

          console.log(Date.now(), 'tap(params):params=', params);
          console.log(Date.now(), 'tap(params):myCardName=', this.myCardName);

          combineLatest([this.search.searchResults$, this.prices.priceResults$])
            .pipe(
              takeUntil(this.destroy$),
              tap(([searchResult, prices]) => {
                console.log(
                  Date.now(),
                  'tap([searchResult, prices]):searchResult=',
                  searchResult
                );
                console.log(
                  Date.now(),
                  'tap([searchResult, prices]):prices=',
                  prices
                );

                if (!Number.isNaN(prices.usd)) {
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
          this.search.updateSearchTerm(this.myCardName);
          this.prices.updatePricesTerm(this.myCardName);
        })
      )
      .subscribe();
  }

  onAddToList() {
    // use backend to add to the list
    // check if user is logged in & redirect if needed
    const token = localStorage.getItem('jwtToken');
    if (!token || this.isTokenExpired(token)) {
      this.router.navigate(['/login']);
      return;
    }
    // user is logged in, so we can use the DB
    this.glue
      .postCardList(
        this.myUser.activeList,
        this.displayCard.name,
        this.displayCard.imgsrc,
        this.displayCard.normalprice
      )
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

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      return !decoded.exp || Date.now() / 1000 >= decoded.exp;
    } catch (error) {
      console.log('isTokenExpired() got an error:', error);
      return true;
    }
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
