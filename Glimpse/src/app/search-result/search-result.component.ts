import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { BackendGlueService } from '../services/backend-glue.service';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [HeaderComponent, CurrencyPipe, CommonModule],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css',
})
export class SearchResultComponent implements OnInit, OnDestroy {
  displayCard!: DisplayCard;

  private backend$!: Subscription;
  private cardNameFromRoute = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private state: GlimpseStateService,
    private glue: BackendGlueService
  ) {
    this.cardNameFromRoute = this.route.snapshot.params['cardName'];
    console.log(this.cardNameFromRoute);
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('lastSearchedCard');
    this.backend$.unsubscribe();
  }

  ngOnInit(): void {
    this.backend$ = this.state.getBackendCardListener().subscribe((card) => {
      console.log(card);
      // 4 cases to check due to existence or lack thereof for card & URL name
      if (
        this.cardNameFromRoute &&
        (!card || this.cardNameFromRoute !== card.name)
      ) {
        // Case 1 and Case 3 combined: Either no backend card but URL card exists,
        // or backend card exists and doesn’t match the URL card
        this.getCardFromBack(this.cardNameFromRoute);
      } else if (!card && !this.cardNameFromRoute) {
        // Case 2: No backend card, no URL card name
        console.log('No backend card, no URL card, likely an error');
        this.state.setErrorMessage('Card not found');
        this.router.navigate(['/404']);
      } else if (card) {
        // Case 4: Backend card exists and matches (or no URL card name)
        this.setDisplayCard(card);
      }
    });
  }

  private getCardFromBack(cardName: string): void {
    this.glue.getCardSearch(cardName).subscribe((response) => {
      if (typeof response === 'string') {
        // error response
        this.state.setErrorMessage(response);
        this.router.navigate(['/404']);
      } else {
        // successful response, response is CardSearch object
        this.state.setBackendCard(response);
        this.setDisplayCard(response);
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
    };
  }
}
