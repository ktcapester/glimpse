import { TestBed } from '@angular/core/testing';

import { CardSuggestionService } from './card-suggestion.service';

describe('CardSuggestionService', () => {
  let service: CardSuggestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardSuggestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
