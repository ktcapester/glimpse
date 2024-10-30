import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';

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

  constructor(
    private route: ActivatedRoute,
    private state: GlimpseStateService
  ) {
    const cardNameInput = this.route.snapshot.params['cardName'];
    console.log(cardNameInput);
  }

  ngOnDestroy(): void {
    this.backend$.unsubscribe();
  }

  ngOnInit(): void {
    this.backend$ = this.state.getBackendCardListener().subscribe((card) => {
      console.log(card);
      if (!card) {
        console.log('Card from state.backendSubject was null');
        return;
      }
      this.displayCard = {
        name: card.name,
        imgsrc: card.imgsrc,
        foilprice: card.usd_foil,
        normalprice: card.usd,
        etchedprice: card.usd_etched,
      };
    });
  }
}
