import { Injectable } from '@angular/core';
import { ScryfallCard } from '../interfaces/scryfall-card.model';


@Injectable({
  providedIn: 'root'
})
export class PriceCalculatorService {

  constructor() { }

  georgeMethod(pricesList: number[]) {
    pricesList.sort((a, b) => a - b);
    var medIdx = pricesList.length / 2;
    var median = pricesList[medIdx];
    if (pricesList.length % 2 == 0) {
      var lower = pricesList[medIdx - 1];
      median = (median + lower) / 2;
    }
    // now do a weighted average with the distance based off index distance from the median
  }

  cardPriceMagic(cardsList: ScryfallCard[]) {
    if (cardsList.length == 0) {
      return NaN;
    }
    if (cardsList.length == 1) {
      return this.getPriceFromCard(cardsList[0])
    }
    if (cardsList.length == 2) {
      // return the cheaper of the 2 prices
      const p0 = this.getPriceFromCard(cardsList[0])
      const p1 = this.getPriceFromCard(cardsList[1])
      if (p0 < p1) {
        return p0
      }
      return p1
    }
    // cardsList.length is at least 3
    // sort by price ascending
    cardsList.sort((a, b) => this.cardCompareFn(a, b))
    var medIdx = cardsList.length / 2;
    var median = this.getPriceFromCard(cardsList[medIdx])
    if (cardsList.length % 2 == 0) {
      var lower = this.getPriceFromCard(cardsList[medIdx - 1])
      median = (median + lower) / 2;
    }
    // pure median result:
    // return median

    // calculating a weighted average with inverse price difference from the median price as the weights
    var numerator = 0;
    var denominator = 0;
    for (let index = 0; index < cardsList.length; index++) {
      const element = cardsList[index];
      const price = this.getPriceFromCard(element)
      if (Number.isNaN(price)) {
        console.log("NaN price for:", element)
      }
      var distance = Math.abs(median - price)
      if (distance == 0) { distance = 1 }
      const weight = 1 / distance;
      numerator += (price * weight);
      denominator += weight;
    }
    return numerator / denominator;
  }

  getPriceFromCard(card: ScryfallCard) {
    return Number.parseFloat(card?.prices?.usd ?? 'NaN');
  }

  cardCompareFn(card0: ScryfallCard, card1: ScryfallCard) {
    const p0 = this.getPriceFromCard(card0)
    const p1 = this.getPriceFromCard(card1)
    if (Number.isNaN(p0)) {
      return 1
    }
    if (Number.isNaN(p1)) {
      return -1
    }
    return p0 - p1
  }

  bigoldfunc(cards: ScryfallCard[]) {
    // process all cards in here
    var usd_cards = []
    var usd_fancy_cards = []
    var eur_cards = []
    var eur_fancy_cards = []
    for (let index = 0; index < cards.length; index++) {
      const element = cards[index];
      if (element.prices.usd) {
        usd_cards.push(element)
      }
      if (element.prices.usd_etched) {
        usd_fancy_cards.push(element)
      }
      if (element.prices.usd_foil) {
        usd_fancy_cards.push(element)
      }
      if (element.prices.eur) {
        eur_cards.push(element)
      }
      if (element.prices.eur_etched) {
        eur_fancy_cards.push(element)
      }
      if (element.prices.eur_foil) {
        eur_fancy_cards.push(element)
      }
    }
    // now that they're separated...sssssssssssssssssssssssssss
  }

}
