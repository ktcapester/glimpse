import { TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { UserSchema } from '../interfaces';
import { environment } from '../../environments/environment';

const mockUser: UserSchema = {
  _id: '123',
  username: 'Test User',
  email: 'test@example.com',
  lists: [],
  createdAt: new Date('2011-10-10T14:48:00.000+09:00'),
  activeList: 'test-list-id',
};

describe('UserService', () => {
  let authSpy: jasmine.SpyObj<AuthService>;
  let storageSpy: jasmine.SpyObj<StorageService>;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    storageSpy = jasmine.createSpyObj('StorageService', [
      'getItem',
      'setItem',
      'removeItem',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), // Provides HttpClient
        provideHttpClientTesting(), // Provides HttpTestingController
        { provide: AuthService, useValue: authSpy },
        { provide: StorageService, useValue: storageSpy },
        UserService,
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const service = TestBed.inject(UserService);
    expect(service).toBeTruthy();
  });

  it('when not logged in, should clear user and remove cache', fakeAsync(() => {
    // Arrange: isLoggedIn → false
    authSpy.isLoggedIn.and.returnValue(false);

    // Act: Re-create service so the effect runs with this spy behavior
    const service = TestBed.inject(UserService);
    tick();

    // Assert: The effect in the constructor runs synchronously for the isLoggedIn check
    expect(service.user()).toBeNull();
    expect(storageSpy.removeItem).toHaveBeenCalledWith('user');
  }));

  it('when logged in and cached, should load user from storage without HTTP call', fakeAsync(() => {
    // Arrange: isLoggedIn → true, storage.getItem returns a JSON string
    authSpy.isLoggedIn.and.returnValue(true);
    storageSpy.getItem.and.returnValue(JSON.stringify(mockUser));

    // Re-create service so the effect runs now
    const service = TestBed.inject(UserService);
    tick();

    // userSignal should be set synchronously from the cached value
    expect(service.user()).toEqual(mockUser);
    expect(storageSpy.removeItem).not.toHaveBeenCalled();
    // No HTTP request expected
    httpMock.expectNone(`${environment.apiURL}/user`);
  }));

  it('when logged in and no cache, should fetch from backend and cache it', fakeAsync(() => {
    // Arrange: isLoggedIn → true, storage.getItem returns null
    authSpy.isLoggedIn.and.returnValue(true);
    storageSpy.getItem.and.returnValue(null);

    // Re-create service so the constructor effect runs
    const service = TestBed.inject(UserService);
    tick();

    // Because fetch happens via firstValueFrom, we need to flush microtasks
    // Expect a single GET request to /user
    const req = httpMock.expectOne(`${environment.apiURL}/user`);
    expect(req.request.method).toBe('GET');
    // Simulate backend response
    req.flush(mockUser);

    // Allow async code to finish
    tick();

    // Should have cached and updated the signal
    expect(storageSpy.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify(mockUser)
    );
    expect(service.user()).toEqual(mockUser);
  }));

  it('if fetch fails, should clear user and remove cache', fakeAsync(() => {
    // Arrange: isLoggedIn → true, storage.getItem returns null
    authSpy.isLoggedIn.and.returnValue(true);
    storageSpy.getItem.and.returnValue(null);

    // Re-create service so the constructor effect runs
    const service = TestBed.inject(UserService);
    tick();

    // Expect GET request, then simulate an error
    const req = httpMock.expectOne(`${environment.apiURL}/user`);
    req.error(new ProgressEvent('Network error'), {
      status: 500,
      statusText: 'Server Error',
    });

    // Allow async code to finish
    tick();

    expect(service.user()).toBeNull();
    expect(storageSpy.removeItem).toHaveBeenCalledWith('user');
  }));

  it('refresh() when logged in should trigger a new fetch', fakeAsync(() => {
    // Arrange: isLoggedIn → true, no cache initially
    authSpy.isLoggedIn.and.returnValue(true);
    storageSpy.getItem.and.returnValue(null);

    // Re-create service so the constructor effect runs
    const service = TestBed.inject(UserService);
    tick();

    // Initial GET from constructor
    const initReq = httpMock.expectOne(`${environment.apiURL}/user`);
    initReq.flush(mockUser);
    tick();

    // Spy on fetchAndCacheUser by clearing spies
    storageSpy.setItem.calls.reset();
    storageSpy.removeItem.calls.reset();
    // Now call refresh(), which should call fetchAndCacheUser() again
    service.refresh();

    const refreshReq = httpMock.expectOne(`${environment.apiURL}/user`);
    expect(refreshReq.request.method).toBe('GET');
    refreshReq.flush(mockUser);
    tick();

    expect(storageSpy.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify(mockUser)
    );
    expect(service.user()).toEqual(mockUser);
  }));

  it('refresh() when not logged in should do nothing', fakeAsync(() => {
    // Arrange: isLoggedIn → false
    authSpy.isLoggedIn.and.returnValue(false);

    // Re-create service so the constructor effect runs
    const service = TestBed.inject(UserService);
    tick();

    storageSpy.setItem.calls.reset();
    storageSpy.removeItem.calls.reset();

    service.refresh();

    // No HTTP calls
    httpMock.expectNone(`${environment.apiURL}/user`);
    expect(storageSpy.setItem).not.toHaveBeenCalled();
    expect(storageSpy.removeItem).not.toHaveBeenCalled();
  }));
});
