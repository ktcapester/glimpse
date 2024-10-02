import { Injectable } from '@angular/core';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';
import { Prices } from '../interfaces/prices.interface';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiURL + '/price';

@Injectable({
  providedIn: 'root',
})
export class PriceCalculatorService {
  constructor() {}

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

  cardCompareFn(card0: ScryfallCard, card1: ScryfallCard, price_name: string) {
    const p0 = this.extractPrice(card0, price_name);
    const p1 = this.extractPrice(card1, price_name);
    if (Number.isNaN(p0)) {
      return 1;
    }
    if (Number.isNaN(p1)) {
      return -1;
    }
    return p0 - p1;
  }

  calculateAllPrices(cards: ScryfallCard[]): Prices {
    // process all cards in here
    var usd_cards = [];
    var usd_etched_cards = [];
    var usd_foil_cards = [];
    var eur_cards = [];
    var eur_etched_cards = [];
    var eur_foil_cards = [];

    for (let index = 0; index < cards.length; index++) {
      const element = cards[index];
      if (element.prices.usd) {
        usd_cards.push(element);
      }
      if (element.prices.usd_etched) {
        usd_etched_cards.push(element);
      }
      if (element.prices.usd_foil) {
        usd_foil_cards.push(element);
      }
      if (element.prices.eur) {
        eur_cards.push(element);
      }
      if (element.prices.eur_etched) {
        eur_etched_cards.push(element);
      }
      if (element.prices.eur_foil) {
        eur_foil_cards.push(element);
      }
    }

    let usd_avg = this.processList(usd_cards, 'usd');
    let usd_etched_avg = this.processList(usd_etched_cards, 'usd_etched');
    let usd_foil_avg = this.processList(usd_foil_cards, 'usd_foil');
    let eur_avg = this.processList(eur_cards, 'eur');
    let eur_etched_avg = this.processList(eur_etched_cards, 'eur_etched');
    let eur_foil_avg = this.processList(eur_foil_cards, 'eur_foil');

    return {
      usd: usd_avg,
      usd_etched: usd_etched_avg,
      usd_foil: usd_foil_avg,
      eur: eur_avg,
      eur_etched: eur_etched_avg,
      eur_foil: eur_foil_avg,
    };
  }

  processList(cards: ScryfallCard[], price_name: string) {
    if (cards.length == 0) {
      return NaN;
    }
    if (cards.length == 1) {
      return this.extractPrice(cards[0], price_name);
    }
    if (cards.length == 2) {
      // return the cheaper of the 2 prices
      const p0 = this.extractPrice(cards[0], price_name);
      const p1 = this.extractPrice(cards[1], price_name);
      if (p0 < p1) {
        return p0;
      }
      return p1;
    }
    // cards.length is at least 3
    // sort by price ascending
    cards.sort((a, b) => this.cardCompareFn(a, b, price_name));
    var medIdx = Math.floor(cards.length / 2);
    var median = this.extractPrice(cards[medIdx], price_name);
    if (cards.length % 2 == 0) {
      var lower = this.extractPrice(cards[medIdx - 1], price_name);
      median = (median + lower) / 2;
    }
    // pure median result:
    // return median

    // calculating a weighted average with inverse price difference from the median price as the weights
    var numerator = 0;
    var denominator = 0;
    for (let index = 0; index < cards.length; index++) {
      const element = cards[index];
      const price = this.extractPrice(element, price_name);
      if (Number.isNaN(price)) {
        console.log('NaN price for:', element);
      }
      var distance = Math.abs(median - price);
      if (distance == 0) {
        distance = 1;
      }
      const weight = 1 / distance;
      numerator += price * weight;
      denominator += weight;
    }
    return numerator / denominator;
  }

  extractPrice(card: ScryfallCard, price_name: string) {
    switch (price_name) {
      case 'usd':
        return Number.parseFloat(card.prices.usd!);
      case 'usd_etched':
        return Number.parseFloat(card.prices.usd_etched!);
      case 'usd_foil':
        return Number.parseFloat(card.prices.usd_foil!);
      case 'eur':
        return Number.parseFloat(card.prices.eur!);
      case 'eur_etched':
        return Number.parseFloat(card.prices.eur_etched!);
      case 'eur_foil':
        return Number.parseFloat(card.prices.eur_foil!);
      default:
        return NaN;
    }
  }
}
