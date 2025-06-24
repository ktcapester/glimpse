export interface UserSchema {
  _id: string;
  email: string;
  username: string;
  lists: string[];
  createdAt: Date;
  activeList: string;
}

export interface ListSchema {
  _id: string;
  user: string;
  name: string;
  description: string;
  totalPrice: number;
  cards: { card: string; quantity: number }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CardSchema {
  _id: string;
  name: string;
  scryfallLink: string;
  imgsrcFull: string;
  imgsrcSmall: string;
  createdAt: Date;
  updatedAt: Date;
  prices:
    | {
        raw: Prices | undefined;
        calc: Prices | undefined;
      }
    | undefined;
}

export interface Prices {
  usd: number;
  usd_etched: number;
  usd_foil: number;
  eur: number;
  eur_etched: number;
  eur_foil: number;
}
