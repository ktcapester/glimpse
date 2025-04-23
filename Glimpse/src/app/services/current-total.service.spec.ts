import { TestBed } from '@angular/core/testing';

import { CurrentTotalService } from './current-total.service';

describe('CurrentTotalService', () => {
  let service: CurrentTotalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentTotalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
