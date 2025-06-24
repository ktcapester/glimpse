import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoResultsComponent } from './no-results.component';

describe('NoResultsComponent', () => {
  let component: NoResultsComponent;
  let fixture: ComponentFixture<NoResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoResultsComponent], // standalone component import
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display the default message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const messageElem = compiled.querySelector('.no-results-typography');
    expect(messageElem?.textContent).toContain(
      'No cards found with that name.'
    );
  });
});
