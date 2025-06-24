import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  HttpClient,
  HttpInterceptorFn,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { currentTotalInterceptor } from './current-total.interceptor';
import { CurrentTotalService } from '../services';
import { environment } from '../../environments/environment';

describe('currentTotalInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let ctServiceSpy: jasmine.SpyObj<CurrentTotalService>;

  beforeEach(() => {
    ctServiceSpy = jasmine.createSpyObj('CurrentTotalService', ['setTotal']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([currentTotalInterceptor])),
        provideHttpClientTesting(),
        { provide: CurrentTotalService, useValue: ctServiceSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const interceptorFn: HttpInterceptorFn = (req, next) =>
      TestBed.runInInjectionContext(() => currentTotalInterceptor(req, next));
    expect(interceptorFn).toBeTruthy();
  });

  it('should update current total on matching URL responses', waitForAsync(() => {
    const url = `${environment.apiURL}/list/123`;
    httpClient.get<{ currentTotal: number }>(url).subscribe();
    const req = httpMock.expectOne(url);

    const mockBody = { currentTotal: 42 };
    req.flush(mockBody);

    expect(ctServiceSpy.setTotal).toHaveBeenCalledWith(42);
  }));

  it('should not update current total on non-matching URL', waitForAsync(() => {
    const url = `${environment.apiURL}/other/endpoint`;
    httpClient.get<{ currentTotal: number }>(url).subscribe();
    const req = httpMock.expectOne(url);

    const mockBody = { currentTotal: 99 };
    req.flush(mockBody);

    expect(ctServiceSpy.setTotal).not.toHaveBeenCalled();
  }));
});
