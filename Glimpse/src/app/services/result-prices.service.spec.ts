import { TestBed } from '@angular/core/testing';

import { ResultPricesService } from './result-prices.service';

describe('ResultPricesService', () => {
  let service: ResultPricesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResultPricesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
