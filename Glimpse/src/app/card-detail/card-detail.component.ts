import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardListItem } from '../interfaces/backend.interface';
import { HeaderComponent } from '../header/header.component';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchDataService } from '../services/search-data.service';
import { BackendGlueService } from '../services/backend-glue.service';

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

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private state: GlimpseStateService,
    private searchdata: SearchDataService,
    private glue: BackendGlueService
  ) {}

  ngOnDestroy(): void {
    console.log(`${this.constructor.name} ngOnDestroy called!`, Date.now());
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
    });

    this.searchdata.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe((card) => {
        if (card) {
          this.setDisplayCard(card);
          this.router.navigate(['/detail', card.name]);
        } else {
          // card was null
          this.state.setErrorMessage('Trouble with searchResults$');
          this.router.navigate(['/404']);
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
  }

  onItemIncrease() {
    this.myCard.count += 1;
    this.updateBackend();
  }

  onItemDecrease() {
    if (this.myCard.count > 0) {
      this.myCard.count -= 1;
    }
    this.updateBackend();
  }

  onItemRemove() {
    this.myCard;
    this.updateBackend();
  }

  private updateBackend() {}
}
