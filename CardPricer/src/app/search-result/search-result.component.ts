import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from "@angular/forms";
import { ScryfallSearchService } from '../services/scryfall-search.service';
import { MyCard } from '../interfaces/my-card.model';
import { ScryfallCard } from '../interfaces/scryfall-card.model';
import { PriceCalculatorService } from '../services/price-calculator.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {

  constructor(private searchService: ScryfallSearchService, private priceService: PriceCalculatorService) { }

  mycard: MyCard = {
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
        this.mycard.name = theCard.name;
        this.mycard.imgsrc = theCard.imgsrc;
      });

    // set up callback for when we get the list of all prints
    this.cardsSub = this.searchService.getListUpdateListener()
      .subscribe((cards: ScryfallCard[]) => {
        this.cardsList = cards;

        // process List
        var numPrintingsNormal = 0;
        var numPrintingsFancy = 0;
        var totalPriceNormal = 0.0;
        var totalPriceFancy = 0.0;

        for (let index = 0; index < this.cardsList.length; index++) {
          const currentCard = this.cardsList[index];

          if (currentCard.prices.usd) {
            numPrintingsNormal += 1;
            totalPriceNormal += Number.parseFloat(currentCard.prices.usd);
          }

          if (currentCard.prices.usd_foil) {
            numPrintingsFancy += 1;
            totalPriceFancy += Number.parseFloat(currentCard.prices.usd_foil);
          }

          if (currentCard.prices.usd_etched) {
            numPrintingsFancy += 1;
            totalPriceFancy += Number.parseFloat(currentCard.prices.usd_etched);
          }

        }

        const avgNormal = this.priceService.cardPriceMagic(this.cardsList);
        const avgFancy = 0;

        // display averages
        this.mycard.normalprice = avgNormal.toFixed(2);
        this.mycard.fancyprice = avgFancy.toFixed(2);

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
