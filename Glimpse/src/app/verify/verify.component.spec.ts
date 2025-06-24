import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';

import { VerifyComponent } from './verify.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { VerifyService } from '../services';
import { signal } from '@angular/core';

describe('VerifyComponent', () => {
  let component: VerifyComponent;
  let fixture: ComponentFixture<VerifyComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockVerifyService: jasmine.SpyObj<VerifyService>;

  const routeSnapshotStub = {
    queryParamMap: {
      get: jasmine.createSpy('get').and.callFake((key: string) => {
        if (key === 'token') {
          return 'fake-token';
        }
        if (key === 'email') {
          return 'user@example.com';
        }
        return null;
      }),
    } as unknown as ParamMap,
  };

  const activatedRouteStub: Partial<ActivatedRoute> = {
    snapshot: routeSnapshotStub,
  } as unknown as ActivatedRoute;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const responseSig = signal(false);
    const successSig = signal(false);

    mockVerifyService = jasmine.createSpyObj(
      'VerifyService',
      ['validateToken'],
      { response: responseSig, success: successSig }
    );

    TestBed.configureTestingModule({
      imports: [VerifyComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
        { provide: VerifyService, useValue: mockVerifyService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call verify.validateToken with email and token from query params on init', () => {
    expect(mockVerifyService.validateToken).toHaveBeenCalledWith(
      'user@example.com',
      'fake-token'
    );
  });

  it('should navigate to "/list" when onClick is called and verify.success() is true', fakeAsync(() => {
    // Change the success signal to true
    (mockVerifyService.success as any).set(true);
    fixture.detectChanges();
    tick();

    component.onClick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/list']);
  }));

  it('should navigate to "/login" when onClick is called and verify.success() is false', fakeAsync(() => {
    // Ensure success signal is false
    (mockVerifyService.success as any).set(false);
    fixture.detectChanges();
    tick();

    component.onClick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should display "Verifying your login..." when response is false', () => {
    // response is initially false
    const compiled = fixture.nativeElement as HTMLElement;
    const titleEl = compiled.querySelector('.message-content')!;
    expect(titleEl.textContent?.trim()).toBe('Verifying your login. . .');
  });

  it('should display success template when response and success are true', fakeAsync(() => {
    // First, update response to true
    (mockVerifyService.response as any).set(true);
    (mockVerifyService.success as any).set(true);
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement as HTMLElement;
    const titleEl = compiled.querySelector('.message-content')!;
    const subtitleEl = compiled.querySelector('.response-message')!;
    const buttonEl = compiled.querySelector('.redirect-button')!;

    expect(titleEl.textContent?.trim()).toBe('Login successful!');
    expect(subtitleEl.textContent?.trim()).toBe(
      'You can now view your saved cards.'
    );
    expect(buttonEl.textContent?.trim()).toBe('Go to list');
  }));

  it('should display failure template when response is true and success is false', fakeAsync(() => {
    // Update response to true, success remains false
    (mockVerifyService.response as any).set(true);
    (mockVerifyService.success as any).set(false);
    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement as HTMLElement;
    const titleEl = compiled.querySelector('.message-content')!;
    const subtitleEl = compiled.querySelector('.response-message')!;
    const buttonEl = compiled.querySelector('.redirect-button')!;

    expect(titleEl.textContent?.trim()).toBe('Login failed, please try again.');
    expect(subtitleEl.textContent?.trim()).toBe(
      'Try the link in your email again. If this problem persists, please request a new email.'
    );
    expect(buttonEl.textContent?.trim()).toBe('Back to sign in');
  }));
});
