import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardListItem } from '../interfaces/backend.interface';
import { HeaderComponent } from '../header/header.component';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { SearchDataService } from '../services/search-data.service';
import { BackendGlueService } from '../services/backend-glue.service';
import { CardDetailService } from '../services/card-detail.service';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [HeaderComponent, CurrencyPipe, CommonModule],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.css',
})
export class CardDetailComponent implements OnInit, OnDestroy {
  displayCard!: DisplayCard;
  myCard: CardListItem = {
    id: 0,
    name: 'Arachnogenesis',
    price: 0,
    count: 4,
  };
  myID = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private state: GlimpseStateService,
    private searchdata: SearchDataService,
    private glue: BackendGlueService,
    private details: CardDetailService
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
    // Set up getting names out of the URL
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const name = params.get('cardName') || '';
      this.searchdata.updateSearchTerm(name);
      const id = parseInt(params.get('cardID') || '');
      this.myID = id;
      this.details.updateDetailFromID(id);
    });

    // why is this here, what is it doing, i don't remember
    // currently this gets the actual card image and prices
    // i think this is okay, i'd like it to get new prices when you look at the detail
    this.searchdata.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe((card) => {
        if (card) {
          this.setDisplayCard(card);
          this.router.navigate(['/detail', this.myID, card.name]);
        } else {
          // card was null
          this.state.setErrorMessage('Trouble with searchResults$');
          this.router.navigate(['/404']);
        }
      });

    this.details.cardFromID$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        console.log('card-detail subscription recieved:', result);
        if (result) {
          this.myCard = result.card;
        } else {
          // error
          this.state.setErrorMessage('Trouble with cardDetails$');
          this.router.navigate(['/404']);
        }
      });

    this.details.patchCard$
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (typeof response === 'string') {
          console.log('what how huh');
        } else {
          this.state.pushNewTotal(response.currentTotal);
        }
      });
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
    // update the price with latest from scryfall
    this.myCard.price = card.usd;
  }

  onItemIncrease() {
    if (this.myCard.count < 99) {
      this.myCard.count += 1;
      this.updateBackend();
    }
  }

  onItemDecrease() {
    if (this.myCard.count > 0) {
      this.myCard.count -= 1;
      this.updateBackend();
    }
  }

  onItemRemove() {
    console.log('onItemRemove');
    console.log(this.myCard);
    this.glue.deleteSingleCard(this.myCard.id).pipe(
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
    );
  }

  private updateBackend() {
    console.log('updateBackend call');
    console.log('myCard:', this.myCard);
    this.details.updatePatchCard(this.myCard);
    // this.glue.patchCardDetails(this.myCard).pipe(
    //   tap((result) => {
    //     console.log(result);

    //     if (typeof result === 'string') {
    //       //error sresponse
    //       this.state.setErrorMessage(result);
    //       this.router.navigate(['/404']);
    //     } else {
    //       // successful response
    //       this.state.pushNewTotal(result.currentTotal);
    //     }
    //   })
    // );
  }
}
