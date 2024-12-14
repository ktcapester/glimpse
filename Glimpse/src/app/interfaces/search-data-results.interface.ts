import { CardDisplayOnly } from './backend.interface';

export interface SearchDataResults {
  cards: CardDisplayOnly[];
  term: string;
  code: string;
  details: string;
}
