import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { LoginService } from '../services';
import { signal } from '@angular/core';

/**
 * FakeLoginService exposes:
 *  - a real `emailSent = signal(false)`
 *  - a.spyable `sendEmail(email: string)` that sets `emailSent` to true
 */
class MockLoginService {
  emailSent = signal<boolean>(false);
  sendEmail = jasmine.createSpy('sendEmail').and.callFake((_: string) => {
    this.emailSent.set(true);
  });
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockLoginService: MockLoginService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: LoginService, useClass: MockLoginService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    mockLoginService = TestBed.inject(
      LoginService
    ) as unknown as MockLoginService;

    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should not call sendEmail if form is invalid', () => {
    // Form is invalid by default (email control is empty)
    component.handleSubmit();
    expect(mockLoginService.sendEmail).not.toHaveBeenCalled();
    expect(mockLoginService.emailSent()).toBeFalse();
  });

  it('should call sendEmail(...) and flip emailSent signal when form is valid', () => {
    // Fill in a valid email and submit
    const emailControl = component.searchForm.get('email')!;
    emailControl.setValue('test@example.com');
    fixture.detectChanges();

    component.handleSubmit();
    fixture.detectChanges();

    expect(mockLoginService.sendEmail).toHaveBeenCalledWith('test@example.com');
    // The fake sendEmail sets emailSent to true synchronously
    expect(mockLoginService.emailSent()).toBeTrue();

    // Verify that template now shows the "email sent" message
    const compiled = fixture.nativeElement as HTMLElement;
    const emailSentDiv = compiled.querySelector('.email-sent');
    expect(emailSentDiv).toBeTruthy();
    expect(emailSentDiv!.textContent).toContain('Email successfully sent');
  });
});
