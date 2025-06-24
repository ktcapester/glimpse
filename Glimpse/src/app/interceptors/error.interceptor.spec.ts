import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, ErrorService } from '../services';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockErrorService: jasmine.SpyObj<ErrorService>;

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => errorInterceptor(req, next));

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    mockErrorService = jasmine.createSpyObj('ErrorService', [
      'setErrorMessage',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should navigate to /login on 401 when not logged in', fakeAsync(() => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    let responseError: any;
    httpClient.get('/test-401').subscribe({
      next: () => fail('should have errored'),
      error: (err) => {
        responseError = err;
      },
    });
    const req = httpMock.expectOne('/test-401');
    // Flush a 401 Unauthorized error
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );

    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(mockErrorService.setErrorMessage).not.toHaveBeenCalled();
    expect(responseError instanceof HttpErrorResponse).toBeTrue();
    expect((responseError as HttpErrorResponse).status).toBe(401);
  }));

  it('should set error message and navigate to /404 on 404', fakeAsync(() => {
    // For a 404, logged-in state does not block error handling
    mockAuthService.isLoggedIn.and.returnValue(true);

    let responseError: any;
    httpClient.get('/test-404').subscribe({
      next: () => fail('should have errored'),
      error: (err) => {
        responseError = err;
      },
    });

    const req = httpMock.expectOne('/test-404');
    // Flush a 404 Not Found error
    req.flush(
      { message: 'Not Found' },
      { status: 404, statusText: 'Not Found' }
    );

    tick();

    expect(mockErrorService.setErrorMessage).toHaveBeenCalledWith(
      'Http failure response for /test-404: 404 Not Found'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/404']);
    expect(responseError instanceof HttpErrorResponse).toBeTrue();
    expect((responseError as HttpErrorResponse).status).toBe(404);
  }));

  it('should set error message for other errors (e.g., 500) without navigation', fakeAsync(() => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    let responseError: any;
    httpClient.get('/test-500').subscribe({
      next: () => fail('should have errored'),
      error: (err) => {
        responseError = err;
      },
    });

    const req = httpMock.expectOne('/test-500');
    // Flush a 500 Internal Server Error
    req.flush(
      { message: 'Server Error' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    tick();

    expect(mockErrorService.setErrorMessage).toHaveBeenCalledWith(
      'Http failure response for /test-500: 500 Internal Server Error'
    );
    expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/login']);
    expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/404']);
    expect(responseError instanceof HttpErrorResponse).toBeTrue();
    expect((responseError as HttpErrorResponse).status).toBe(500);
  }));

  it('should rethrow the original error after handling', fakeAsync(() => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    let thrown: any;
    httpClient.get('/test-rethrow').subscribe({
      next: () => fail('should have errored'),
      error: (err) => {
        thrown = err;
      },
    });

    const req = httpMock.expectOne('/test-rethrow');
    // Flush any error (e.g., 418 I'm a teapot)
    req.flush(
      { message: "I'm a teapot" },
      { status: 418, statusText: "I'm a teapot" }
    );

    tick();

    // The interceptor returns throwError(() => error), so the same HttpErrorResponse should be rethrown
    expect(thrown instanceof HttpErrorResponse).toBeTrue();
    expect((thrown as HttpErrorResponse).status).toBe(418);
  }));
});
