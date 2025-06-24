import { TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CardDetailService } from './card-detail.service';
import { environment } from '../../environments/environment';
import { CardSchema } from '../interfaces';

describe('CardDetailService', () => {
  let service: CardDetailService;
  let httpMock: HttpTestingController;
  const listId = 'test-list';
  const cardId = 'test-card';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        CardDetailService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CardDetailService);
    httpMock = TestBed.inject(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch card details successfully', fakeAsync(() => {
    const mockResponse = {
      card: { _id: cardId, name: 'Sample Card' } as CardSchema,
      quantity: 5,
    };
    let result: { card: CardSchema; quantity: number } | undefined;

    service.getCard(listId, cardId).subscribe((res) => {
      result = res;
    });

    const req = httpMock.expectOne(
      `${environment.apiURL}/list/${listId}/cards/${cardId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    tick(); // advance the virtual clock

    expect(result).toEqual(mockResponse);
  }));

  it('should return fallback object on GET error', fakeAsync(() => {
    let result: { card: CardSchema; quantity: number } | undefined;

    service.getCard(listId, cardId).subscribe((res) => {
      result = res;
    });

    const req = httpMock.expectOne(
      `${environment.apiURL}/list/${listId}/cards/${cardId}`
    );
    expect(req.request.method).toBe('GET');
    req.error(new ProgressEvent('error')); // network error

    tick();

    expect(result).toEqual({ card: {} as CardSchema, quantity: 0 });
  }));

  it('should send PATCH and return currentTotal on updateCard()', fakeAsync(() => {
    const price = 12.34;
    const quantity = 3;
    const mockResponse = { currentTotal: 150 };
    let result: { currentTotal: number } | undefined;

    service.updateCard(listId, cardId, price, quantity).subscribe((res) => {
      result = res;
    });

    const req = httpMock.expectOne(
      `${environment.apiURL}/list/${listId}/cards/${cardId}`
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ price, quantity });
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockResponse);

    tick();

    expect(result).toEqual(mockResponse);
  }));

  it('should send DELETE and return currentTotal on deleteCard()', fakeAsync(() => {
    const mockResponse = { currentTotal: 75 };
    let result: { currentTotal: number } | undefined;

    service.deleteCard(listId, cardId).subscribe((res) => {
      result = res;
    });

    const req = httpMock.expectOne(
      `${environment.apiURL}/list/${listId}/cards/${cardId}`
    );
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockResponse);

    tick();

    expect(result).toEqual(mockResponse);
  }));
});
