import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { LoginService } from './login.service';
import { environment } from '../../environments/environment';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  const testEmail = 'test@example.com';
  const apiUrl = `${environment.apiURL}/auth/magic-link`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LoginService,
      ],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set emailSent to true when the HTTP POST returns true', fakeAsync(() => {
    // Initially, the signal should be false
    expect(service.emailSent()).toBeFalse();

    // Call the sendEmail() method (returns a Promise)
    service.sendEmail(testEmail);

    // Expect one POST request to the correct URL with the email payload
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: testEmail });

    // Flush a successful response
    req.flush({ success: true });

    // Advance the microtasks so that firstValueFrom resolves and the signal updates
    tick();

    // Now the signal should be true
    expect(service.emailSent()).toBeTrue();
  }));

  it('should set emailSent to false when the HTTP POST returns false', fakeAsync(() => {
    // Ensure the signal starts as false (default)
    expect(service.emailSent()).toBeFalse();

    service.sendEmail(testEmail);

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: testEmail });

    // Flush a response with success: false
    req.flush({ success: false });

    tick();

    expect(service.emailSent()).toBeFalse();
  }));

  it('should set emailSent to false when the HTTP POST errors out', fakeAsync(() => {
    // Ensure initial signal is false
    expect(service.emailSent()).toBeFalse();

    service.sendEmail(testEmail);

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: testEmail });

    // Simulate a network or server error
    const mockError = new ProgressEvent('Network error');
    req.error(mockError, {
      status: 500,
      statusText: 'Server Error',
    });

    tick();

    expect(service.emailSent()).toBeFalse();
  }));
});
