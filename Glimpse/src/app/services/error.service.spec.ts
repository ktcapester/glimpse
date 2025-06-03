import { TestBed } from '@angular/core/testing';

import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a default error message initially', () => {
    expect(service.errorMessage()).toEqual('Default Error Message');
  });

  it('should update the message when calling setErrorMessage()', () => {
    const message = 'New Message';
    service.setErrorMessage(message);
    expect(service.errorMessage()).toEqual(message);
  });
});
