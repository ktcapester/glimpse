import { TestBed } from '@angular/core/testing';

import { MagicLinkService } from './magic-link.service';

describe('MagicLinkService', () => {
  let service: MagicLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MagicLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
