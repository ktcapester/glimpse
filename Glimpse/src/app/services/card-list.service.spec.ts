import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CardListService } from './card-list.service';
import { environment } from '../../environments/environment';
import { CardSchema, ListData } from '../interfaces';

describe('CardListService', () => {
  let service: CardListService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiURL}/list`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CardListService,
      ],
    });

    service = TestBed.inject(CardListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getList should return mapped ListData on success', waitForAsync(() => {
    const mockBackendData = {
      list: [
        {
          card: {
            _id: '1',
            name: 'Card One',
            prices: { calc: { usd: 5 } },
          } as CardSchema,
          quantity: 2,
        },
      ],
      currentTotal: 10,
    };

    const expectedResponse: ListData = {
      list: [
        {
          id: '1',
          name: 'Card One',
          price: 5,
          count: 2,
        },
      ],
      currentTotal: 10,
    };

    service.getList('abc123').subscribe((data) => {
      expect(data).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/abc123`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockBackendData);
  }));

  it('getList should return empty ListData on error', waitForAsync(() => {
    service.getList('abc123').subscribe((data) => {
      expect(data).toEqual({ list: [], currentTotal: 0 });
    });

    const req = httpMock.expectOne(`${apiUrl}/abc123`);
    req.error(new ProgressEvent('error')); // network error
  }));

  it('deleteList should return mapped ListData on success', waitForAsync(() => {
    const mockBackendData = {
      list: [
        {
          card: {
            _id: '2',
            name: 'Card Two',
            prices: { calc: { usd: 7 } },
          } as CardSchema,
          quantity: 3,
        },
      ],
      currentTotal: 21,
    };

    const expectedResponse: ListData = {
      list: [
        {
          id: '2',
          name: 'Card Two',
          price: 7,
          count: 3,
        },
      ],
      currentTotal: 21,
    };

    service.deleteList('def456').subscribe((data) => {
      expect(data).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/def456`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockBackendData);
  }));

  it('deleteList should return empty ListData on error', waitForAsync(() => {
    service.deleteList('def456').subscribe((data) => {
      expect(data).toEqual({ list: [], currentTotal: 0 });
    });

    const req = httpMock.expectOne(`${apiUrl}/def456`);
    req.error(new ProgressEvent('error')); // delete error
  }));
});
