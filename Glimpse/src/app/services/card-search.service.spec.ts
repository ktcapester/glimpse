import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CardSearchService } from './card-search.service';
import { environment } from '../../environments/environment';
import { CardDisplayOnly } from '../interfaces';

describe('CardSearchService', () => {
  let service: CardSearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CardSearchService,
      ],
    });
    service = TestBed.inject(CardSearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should search for card and return results', fakeAsync(() => {
    const mockResponse: CardDisplayOnly[] = [
      {
        id: '1',
        name: 'Test Card',
        imgsrc: 'http://example.com/image.jpg',
        scryfallLink: 'fake.scryfall.link',
      } as CardDisplayOnly,
    ];

    let result: CardDisplayOnly[] | undefined;
    service.searchForCard('Test').subscribe((res) => {
      result = res;
    });

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url === `${environment.apiURL}/search` &&
        request.params.get('name') === 'Test'
    );
    expect(req.request.params.get('name')).toBe('Test');

    req.flush(mockResponse);

    expect(result).toEqual(mockResponse);
  }));
});
