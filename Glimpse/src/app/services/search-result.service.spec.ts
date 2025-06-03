import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { SearchResultService } from './search-result.service';
import { environment } from '../../environments/environment';
import { CardSchema } from '../interfaces/schemas.interface';

describe('SearchResultService', () => {
  let service: SearchResultService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SearchResultService,
      ],
    });
    service = TestBed.inject(SearchResultService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifies that no unmatched requests are outstanding.
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch card data via GET', () => {
    const dummyCard: CardSchema = {
      _id: '123',
      name: 'Black Lotus',
      imgsrcFull: 'https://img.scryfall/localhost/lotus.jpg',
      prices: {
        calc: {
          usd: 10000,
          usd_foil: 20000,
          usd_etched: 0,
          eur: 10000,
          eur_foil: 20000,
          eur_etched: 0,
        },
        raw: undefined,
      },
      scryfallLink: 'https://scryfall.com/card/lotus',
      imgsrcSmall: '',
      createdAt: new Date(),
      updateAt: new Date(),
    };

    service.getCard('Black Lotus').subscribe((card) => {
      expect(card).toEqual(dummyCard);
    });

    // Expect one HTTP request to the correct URL with the name param
    const req = httpMock.expectOne(
      `${environment.apiURL}/price?name=Black%20Lotus`
    );
    expect(req.request.method).toBe('GET');
    req.flush(dummyCard);
  });

  it('should cache repeated getCard() calls', () => {
    const dummyCard: CardSchema = {
      _id: '123',
      name: 'Black Lotus',
      imgsrcFull: 'https://img.scryfall/localhost/lotus.jpg',
      prices: {
        calc: {
          usd: 10000,
          usd_foil: 20000,
          usd_etched: 0,
          eur: 10000,
          eur_foil: 20000,
          eur_etched: 0,
        },
        raw: undefined,
      },
      scryfallLink: 'https://scryfall.com/card/lotus',
      imgsrcSmall: '',
      createdAt: new Date(),
      updateAt: new Date(),
    };

    // Subscribe twice
    const obs1 = service.getCard('Black Lotus');
    const obs2 = service.getCard('Black Lotus');
    expect(obs1).toBe(obs2, 'should return the same shared Observable');

    // Trigger the HTTP once
    obs1.subscribe((card) => expect(card).toEqual(dummyCard));
    // Only one matching request in the queue
    const reqs = httpMock.match(
      `${environment.apiURL}/price?name=Black%20Lotus`
    );
    expect(reqs.length).toBe(1);
    reqs[0].flush(dummyCard);
  });

  it('should POST cardID and return updated total', () => {
    const fakeCard = { _id: 'xyz' } as CardSchema;
    const fakeListId = 'list123';

    service.addCard(fakeCard, fakeListId).subscribe((total) => {
      expect(total).toBe(42);
    });

    const req = httpMock.expectOne(`${environment.apiURL}/list/${fakeListId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ cardID: 'xyz' });

    // Simulate server returning { currentTotal: 42 }
    req.flush({ currentTotal: 42 });
  });
});
