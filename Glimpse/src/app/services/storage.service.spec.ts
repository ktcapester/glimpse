import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getItem', () => {
    it('should return the stored value when localStorage.getItem succeeds', () => {
      const key = 'myKey';
      const expectedValue = 'someValue';
      spyOn(localStorage, 'getItem').and.returnValue(expectedValue);

      const result = service.getItem(key);

      expect(localStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toBe(expectedValue);
    });

    it('should return null when localStorage.getItem throws an error', () => {
      const key = 'errorKey';
      spyOn(localStorage, 'getItem').and.throwError('QuotaExceededError');

      const result = service.getItem(key);

      expect(localStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
  });

  describe('#setItem', () => {
    it('should call localStorage.setItem with the correct arguments', () => {
      const key = 'testKey';
      const value = 'testValue';
      const setItemSpy = spyOn(localStorage, 'setItem').and.callThrough();

      service.setItem(key, value);

      expect(setItemSpy).toHaveBeenCalledWith(key, value);
    });

    it('should not throw when localStorage.setItem throws an error', () => {
      const key = 'quotaKey';
      const value = 'bigValue';
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');

      expect(() => service.setItem(key, value)).not.toThrow();
      expect(localStorage.setItem).toHaveBeenCalledWith(key, value);
    });
  });

  describe('#removeItem', () => {
    it('should call localStorage.removeItem with the correct key', () => {
      const key = 'removeKey';
      const removeSpy = spyOn(localStorage, 'removeItem').and.callThrough();

      service.removeItem(key);

      expect(removeSpy).toHaveBeenCalledWith(key);
    });

    it('should not throw when localStorage.removeItem throws an error', () => {
      const key = 'badKey';
      spyOn(localStorage, 'removeItem').and.throwError('SomeError');

      expect(() => service.removeItem(key)).not.toThrow();
      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });
});
