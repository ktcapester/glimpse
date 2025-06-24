import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services'; // adjust path if needed
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let interceptor: HttpInterceptorFn;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    interceptor = (req, next) =>
      TestBed.runInInjectionContext(() => authInterceptor(req, next));
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header and withCredentials when token is present', () => {
    // Arrange: create a mock AuthService that returns a token
    const mockAuthService = jasmine.createSpyObj('AuthService', [
      'token',
      'refreshToken',
      'clearToken',
    ]);
    mockAuthService.token.and.returnValue('fake-token');
    TestBed.overrideProvider(AuthService, { useValue: mockAuthService });

    // Create a dummy request
    const req = new HttpRequest('GET', '/test');
    let passedReq: HttpRequest<any> | undefined;

    // next function should capture the request it receives
    const nextFn = (request: HttpRequest<any>) => {
      passedReq = request;
      return of(new HttpResponse({ status: 200 }));
    };

    // Act: run the interceptor
    interceptor(req, nextFn).subscribe();

    // Assert: the outgoing request was cloned with Authorization header and withCredentials
    expect(passedReq).toBeDefined();
    expect(passedReq!.headers.get('Authorization')).toBe('Bearer fake-token');
    expect(passedReq!.withCredentials).toBeTrue();
    // Ensure token() was called
    expect(mockAuthService.token).toHaveBeenCalled();
  });

  it('should not modify auth/refresh-token requests', () => {
    // Arrange: mock AuthService (but token() should not be called for refresh-token URL)
    const mockAuthService = jasmine.createSpyObj('AuthService', [
      'token',
      'refreshToken',
      'clearToken',
    ]);
    mockAuthService.token.and.returnValue('fake-token');
    TestBed.overrideProvider(AuthService, { useValue: mockAuthService });

    // Create a request whose URL includes 'auth/refresh-token'
    const refreshReq = new HttpRequest('GET', '/api/auth/refresh-token');
    let passedReq: HttpRequest<any> | undefined;

    const nextFn = (request: HttpRequest<any>) => {
      passedReq = request;
      return of(new HttpResponse({ status: 200 }));
    };

    // Act
    interceptor(refreshReq, nextFn).subscribe();

    // Assert: request was passed through unchanged
    expect(passedReq).toBe(refreshReq);
    expect(passedReq!.headers.has('Authorization')).toBeFalse();
    expect(mockAuthService.token).not.toHaveBeenCalled();
  });

  it('should refresh token and retry request on 401 error', fakeAsync(() => {
    // Arrange: set up AuthService so token() returns 'old-token' initially,
    // and refreshToken() updates it to 'new-token'
    let tokenValue = 'old-token';
    const mockAuthService = jasmine.createSpyObj('AuthService', [
      'token',
      'refreshToken',
      'clearToken',
    ]);
    mockAuthService.token.and.callFake(() => tokenValue);
    mockAuthService.refreshToken.and.callFake(() => {
      tokenValue = 'new-token';
      return Promise.resolve();
    });
    mockAuthService.clearToken = jasmine.createSpy('clearToken');
    TestBed.overrideProvider(AuthService, { useValue: mockAuthService });

    // Create a dummy GET request
    const initialReq = new HttpRequest('GET', '/data');
    const requests: HttpRequest<any>[] = [];
    let callCount = 0;

    // nextFn simulates: first call → 401 error; second call → succeed
    const nextFn = (req: HttpRequest<any>) => {
      requests.push(req);
      callCount++;
      if (callCount === 1) {
        return throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              statusText: 'Unauthorized',
              url: '/data',
            })
        );
      } else {
        return of(new HttpResponse({ status: 200 }));
      }
    };

    let responseStatus: number | undefined;
    let responseError: any;

    // Act: subscribe to the interceptor chain
    interceptor(initialReq, nextFn).subscribe({
      next: (event) => {
        if (event instanceof HttpResponse) {
          responseStatus = event.status;
        }
      },
      error: (err) => {
        responseError = err;
      },
    });

    // Flush microtasks so that refreshToken() promise resolves
    tick();

    // Assert: two requests were made
    expect(requests.length).toBe(2);

    // First request used the old token
    expect(requests[0].headers.get('Authorization')).toBe('Bearer old-token');
    expect(requests[0].withCredentials).toBeTrue();

    // After refresh, second request uses the new token
    expect(requests[1].headers.get('Authorization')).toBe('Bearer new-token');
    expect(requests[1].withCredentials).toBeTrue();

    // Final response should have succeeded
    expect(responseStatus).toBe(200);
    expect(responseError).toBeUndefined();

    // Ensure refreshToken() was called once
    expect(mockAuthService.refreshToken).toHaveBeenCalledTimes(1);
  }));

  it('should clear token and propagate error if refresh fails', fakeAsync(() => {
    // Arrange: token() returns 'old-token', but refreshToken() rejects
    let tokenValue = 'old-token';
    const mockAuthService = jasmine.createSpyObj('AuthService', [
      'token',
      'refreshToken',
      'clearToken',
    ]);
    mockAuthService.token.and.callFake(() => tokenValue);
    mockAuthService.refreshToken.and.callFake(() =>
      Promise.reject(new Error('refresh failed'))
    );
    mockAuthService.clearToken = jasmine.createSpy('clearToken');
    TestBed.overrideProvider(AuthService, { useValue: mockAuthService });

    // initial request that triggers a 401
    const initialReq = new HttpRequest('GET', '/protected');
    let requestsMade = 0;
    const nextFn = (req: HttpRequest<any>) => {
      requestsMade++;
      // Always return 401 on the first (and only) attempt
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            url: '/protected',
          })
      );
    };

    let caughtError: any;
    interceptor(initialReq, nextFn).subscribe({
      next: () => {
        // should not happen
      },
      error: (err) => {
        caughtError = err;
      },
    });

    // Flush microtasks to let refreshToken() rejection propagate
    tick();

    // Assert: nextFn called only once, since retry isn't attempted when refresh fails
    expect(requestsMade).toBe(1);

    // clearToken should have been called due to refresh failure
    expect(mockAuthService.clearToken).toHaveBeenCalledTimes(1);

    // The propagated error should be the same as the rejection from refreshToken()
    expect(caughtError).toEqual(new Error('refresh failed'));
  }));
});
