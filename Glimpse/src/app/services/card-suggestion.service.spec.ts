import { TestBed } from '@angular/core/testing';
import { CardSuggestionService } from './card-suggestion.service';
import { CardDisplayOnly } from '../interfaces';

describe('CardSuggestionService', () => {
  let service: CardSuggestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardSuggestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have an empty list of cards initially', () => {
    // The readonly signal `cards` should start as an empty array
    expect(service.cards()).toEqual([]);
  });

  it('should update suggestions when calling updateSuggestions()', () => {
    // Define a dummy array of CardDisplayOnly. We can cast an empty object to CardDisplayOnly,
    // since TypeScript’s type-checking is compile-time only.
    const dummyCards: CardDisplayOnly[] = [
      {} as CardDisplayOnly,
      {} as CardDisplayOnly,
    ];

    service.updateSuggestions(dummyCards);
    expect(service.cards()).toBe(dummyCards);
  });
});
