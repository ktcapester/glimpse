import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private state: GlimpseStateService,
    private searchdata: SearchDataService
  ) {}

  ngOnDestroy(): void {
    console.log('SearchResult ngOnDestroy called!', Date.now());
    // this.searchdata.clearSearchResults(); // maybe not needed here?
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    console.log('SearchResult ngOnInit called!', Date.now());
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
          this.router.navigate(['/result', card.name]);
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

  onAddToList() {
    // use backend to add to the list
  }

  onGoToScryfall() {
    window.open(this.displayCard.scryfallLink, '_blank');
  }
}
