import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the disclaimers container', () => {
    const disclaimersEl = fixture.debugElement.query(By.css('.disclaimers'));
    expect(disclaimersEl).toBeTruthy();
  });

  it('should apply the CSS class from the `footer-min` input signal', fakeAsync(() => {
    fixture.componentRef.setInput('minSize', 'footer-min');
    fixture.detectChanges();

    const disclaimersEl = fixture.debugElement.query(By.css('.disclaimers'));
    expect(disclaimersEl.nativeElement.classList).toContain('footer-min');
  }));
});
