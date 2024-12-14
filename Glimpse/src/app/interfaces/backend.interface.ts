export interface CardDisplayOnly {
  name: string;
  imgsrc: string;
  scryfall: string;
}

export interface CardSearch {
  name: string;
  imgsrc: string;
  usd: number;
  usd_etched: number;
  usd_foil: number;
  eur: number;
  eur_etched: number;
  eur_foil: number;
}

export interface CardPrices {
  usd: number;
  usd_etched: number;
  usd_foil: number;
  eur: number;
  eur_etched: number;
  eur_foil: number;
}

export interface CardListItem {
  id: number;
  name: string;
  price: number;
  count: number;
}
