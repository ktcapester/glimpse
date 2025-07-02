import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VerifyService } from './verify.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('VerifyService', () => {
  let service: VerifyService;
  let httpMock: HttpTestingController;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['setToken', 'clearToken']);

    TestBed.configureTestingModule({
      providers: [
        VerifyService,
        { provide: AuthService, useValue: spy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(VerifyService);
    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should reset signals when validateToken is called', () => {
    // Initially, signals default to false
    expect(service.response()).toBeFalse();
    expect(service.success()).toBeFalse();

    // Manually set them to true to simulate a previous run
    (service as any)._response.set(true);
    (service as any)._success.set(true);
    expect(service.response()).toBeTrue();
    expect(service.success()).toBeTrue();

    service.validateToken('user@example.com', 'token123');
    // Immediately after calling validateToken, both should be reset to false
    expect(service.response()).toBeFalse();
    expect(service.success()).toBeFalse();

    // Clean up the HTTP call
    const req = httpMock.expectOne((req) =>
      req.url.startsWith(`${environment.apiURL}/link/verify`)
    );
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should call setToken, set success → true, and response → true on successful validation', fakeAsync(() => {
    service.validateToken('user@example.com', 'validToken');

    const req = httpMock.expectOne(
      (req) => req.url === `${environment.apiURL}/link/verify`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('email')).toBe('user@example.com');
    expect(req.request.params.get('token')).toBe('validToken');

    const mockResponse = { accessToken: 'abc123' };
    req.flush(mockResponse);
    tick();

    expect(authSpy.setToken).toHaveBeenCalledWith('abc123');
    expect(service.success()).toBeTrue();
    expect(service.response()).toBeTrue();
  }));

  it('should call clearToken, set success → false, and response → true on HTTP error', fakeAsync(() => {
    service.validateToken('user@example.com', 'badToken');

    const req = httpMock.expectOne(
      (req) => req.url === `${environment.apiURL}/link/verify`
    );
    expect(req.request.method).toBe('POST');

    req.flush(
      { message: 'Invalid token' },
      { status: 400, statusText: 'Bad Request' }
    );
    tick();

    expect(authSpy.clearToken).toHaveBeenCalled();
    expect(service.success()).toBeFalse();
    expect(service.response()).toBeTrue();
  }));
});
