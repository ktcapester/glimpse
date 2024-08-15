import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm, FormsModule } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { ScryfallSearchService } from '../services/scryfall-search.service';
import { DisplayCard } from '../interfaces/display-card.interface';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';
import { PriceCalculatorService } from '../services/price-calculator.service';
import { CardStateService } from '../services/card-state.service';

@Component({
    selector: 'app-search-result',
    templateUrl: './search-result.component.html',
    styleUrls: ['./search-result.component.css'],
    standalone: true,
    imports: [FormsModule]
})
export class SearchResultComponent implements OnInit {

  resultCard: ScryfallCard | null;

  constructor(private cards: CardStateService, private route: ActivatedRoute, private searchService: ScryfallSearchService, private priceService: PriceCalculatorService) {
    const cardNameInput = this.route.snapshot.params['cardName'];
    this.resultCard = this.cards.getCardByName(cardNameInput);
    
   }

  displayedCard: DisplayCard = {
    name: '',
    imgsrc: '',
    normalprice: '-.-',
    fancyprice: '-.-'
  };

  private cardsSub!: Subscription;
  private displaySub!: Subscription;
  cardsList: ScryfallCard[] = [];

  ngOnInit(): void {

    // set up callback for when fuzzy search returns a card to display
    this.displaySub = this.searchService.getCardUpdateListener()
      .subscribe((theCard) => {
        this.displayedCard.name = theCard.name;
        this.displayedCard.imgsrc = theCard.imgsrc;
      });

    // set up callback for when we get the list of all prints
    this.cardsSub = this.searchService.getListUpdateListener()
      .subscribe((cards: ScryfallCard[]) => {
        this.cardsList = cards;

        const avgNormal = this.priceService.cardPriceMagic(this.cardsList);
        const avgFancy = 0;

        // display averages
        this.displayedCard.normalprice = avgNormal.toFixed(2);
        this.displayedCard.fancyprice = avgFancy.toFixed(2);

      });

    // now that callbacks are set up, make http request
    // do fuzzy search with the provided search term
    this.searchService.fuzzySearch('fell ston');

  }

  ngOnDestroy(): void {
    this.cardsSub.unsubscribe();
    this.displaySub.unsubscribe();
  }

  onSearchSubmit(form: NgForm) {

    if (form.invalid) {
      return;
    }

    this.searchService.fuzzySearch(form.value.searchField);
  }
}
