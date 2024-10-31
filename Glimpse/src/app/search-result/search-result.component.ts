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
      if (!card) {
        console.log('Card from state.backendSubject was null, checking url');
        if (this.cardNameFromRoute) {
          this.getCardFromBack(this.cardNameFromRoute);
        } else {
          console.log('no backend card, no URL card, probably an error');
        }
        return;
      }

      if (this.cardNameFromRoute != card.name) {
        this.getCardFromBack(this.cardNameFromRoute);
      } else {
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
