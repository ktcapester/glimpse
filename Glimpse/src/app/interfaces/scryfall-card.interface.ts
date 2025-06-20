// Not currently used, but keeping for my reference
export interface ScryfallCard {
  name: string;
  id: string;
  image_uris:
    | {
        large: string;
        normal: string;
        small: string;
        png: string;
      }
    | undefined;
  prints_search_uri: string;
  prices: {
    usd: string | undefined;
    usd_foil: string | undefined;
    usd_etched: string | undefined;
    eur: string | undefined;
    eur_foil: string | undefined;
    eur_etched: string | undefined;
  };
  card_faces: any;
}
