import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardListItem } from '../interfaces/backend.interface';
import { HeaderComponent } from '../header/header.component';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { BackendGlueService } from '../services/backend-glue.service';
import { CardDetailService } from '../services/card-detail.service';
import { ResultPricesService } from '../services/result-prices.service';
import { UserService } from '../services/user.service';
import { UserSchema } from '../interfaces/schemas.interface';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [HeaderComponent, CurrencyPipe, CommonModule],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.css',
})
export class CardDetailComponent implements OnInit, OnDestroy {
  displayCard!: DisplayCard;
  myCard!: CardListItem;
  myUser!: UserSchema;
  myID = '';
  loadingDone = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private state: GlimpseStateService,
    private glue: BackendGlueService,
    private prices: ResultPricesService,
    private details: CardDetailService,
    private userService: UserService
  ) {}

  ngOnDestroy(): void {
    console.log(`${this.constructor.name} ngOnDestroy called!`, Date.now());
    this.details.clearCardDetails();
    this.details.clearPatchCard();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    console.log(
      `${this.constructor.name} ngOnInit called!`,
      new Date().toISOString().split('T')[1].slice(0, 12)
    );

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
          this.details.updateSearchFromName(name);
          this.prices.updatePricesTerm(name);
          const id = params.get('cardID') || '';
          this.myID = id;
          this.details.updateDetailFromID(this.myUser.activeList, id);
        })
      )
      .subscribe();

    // wait for both API calls to return before presenting data
    combineLatest([
      this.details.detailSearchResults$,
      this.details.cardFromID$,
      this.prices.priceResults$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap(([searchResult, cardDetails, cardPrices]) => {
          if (!searchResult) {
            this.state.setErrorMessage('Trouble with detailSearchResults$');
            this.router.navigate(['/404']);
            return;
          }
          if (!cardDetails) {
            this.state.setErrorMessage('Trouble with cardFromID$');
            this.router.navigate(['/404']);
            return;
          }
          if (!cardPrices) {
            this.state.setErrorMessage('Trouble with priceResults$');
            this.router.navigate(['/404']);
            return;
          }
          this.myCard = cardDetails;

          const cardDisp = searchResult.cards[0];

          this.displayCard = {
            name: cardDisp.name,
            imgsrc: cardDisp.imgsrc,
            foilprice: cardPrices.usd_foil,
            normalprice: cardPrices.usd,
            etchedprice: cardPrices.usd_etched,
            scryfallLink: cardDisp.scryfall,
          };

          // update the price with latest from scryfall

          this.myCard.price = cardPrices.usd;

          this.loadingDone = true;
        })
      )
      .subscribe();

    this.details.patchCard$
      .pipe(
        takeUntil(this.destroy$),
        tap((response) => {
          this.state.pushNewTotal(response);
        })
      )
      .subscribe();
  }

  private setDisplayCard(card: any): void {
    this.displayCard = {
      name: card.name,
      imgsrc: card.imgsrc,
      foilprice: card.usd_foil, // ???
      normalprice: card.usd, // ???
      etchedprice: card.usd_etched, // ???
      scryfallLink: card.scryfallLink,
    };
    // update the price with latest from scryfall ???
    this.myCard.price = card.usd;
  }

  onItemIncrease() {
    if (this.myCard.count < 99) {
      this.myCard.count += 1;
      this.details.updatePatchCard(this.myUser.activeList, this.myCard);
    }
  }

  onItemDecrease() {
    if (this.myCard.count > 0) {
      this.myCard.count -= 1;
      this.details.updatePatchCard(this.myUser.activeList, this.myCard);
    }
  }

  onItemRemove() {
    console.log('onItemRemove');
    console.log(this.myCard);
    this.glue
      .deleteSingleCard(this.myUser.activeList, this.myCard.id)
      .pipe(
        takeUntil(this.destroy$),
        tap((result) => {
          console.log('glue.delete result:', result);
          if (typeof result === 'string') {
            this.state.setErrorMessage(result);
            this.router.navigate(['/404']);
          } else {
            // successful response
            // aka response is { list, total}
            this.state.pushNewTotal(result.currentTotal);
            // return to list page after removing
            this.router.navigate(['/list']);
          }
        })
      )
      .subscribe();
  }
}
