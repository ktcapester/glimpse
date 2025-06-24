import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    // Create a spy object for StorageService
    storageSpy = jasmine.createSpyObj('StorageService', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    // Have getItem return an initial token
    storageSpy.getItem.and.returnValue('initialToken');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: StorageService, useValue: storageSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  }));

  afterEach(() => {
    httpMock.verify();
    storageSpy.setItem.calls.reset();
    storageSpy.removeItem.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize token from storage', () => {
    // The tokenSignal should have picked up the value from storage.getItem
    expect(service.token()).toBe('initialToken');
    // isLoggedIn should reflect that a token exists
    expect(service.isLoggedIn()).toBeTrue();
    // The effect in the constructor persists the initial token
    expect(storageSpy.setItem).toHaveBeenCalledWith('jwtToken', 'initialToken');
  });

  it('should set token and persist it', fakeAsync(() => {
    service.setToken('newToken');
    tick(); // clears the effect() microtask.
    expect(service.token()).toBe('newToken');
    expect(service.isLoggedIn()).toBeTrue();
    expect(storageSpy.setItem).toHaveBeenCalledWith('jwtToken', 'newToken');
  }));

  it('should clear token and remove it from storage', fakeAsync(() => {
    service.clearToken();
    tick(); // clears the effect() microtask.
    expect(service.token()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
    expect(storageSpy.removeItem).toHaveBeenCalledWith('jwtToken');
  }));

  it('should refresh token via HTTP and update tokenSignal & storage', fakeAsync(() => {
    let refreshDone = false;
    service.refreshToken().then(() => (refreshDone = true));

    const req = httpMock.expectOne(`${environment.apiURL}/auth/refresh-token`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();

    // Simulate backend response
    req.flush({ accessToken: 'refreshedToken' });
    tick(); // clears the service.refreshToken() promise

    expect(refreshDone).toBeTrue();

    tick(); // clears the effect() microtask.

    expect(service.token()).toBe('refreshedToken');
    expect(service.isLoggedIn()).toBeTrue();
    expect(storageSpy.setItem).toHaveBeenCalledWith(
      'jwtToken',
      'refreshedToken'
    );
  }));
});
