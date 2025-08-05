import { TestBed } from '@angular/core/testing';

import { AccountMenuService } from './account-menu.service';

describe('AccountMenuService', () => {
  let service: AccountMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
