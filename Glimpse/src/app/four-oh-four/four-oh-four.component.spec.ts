import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FourOhFourComponent } from './four-oh-four.component';
import { ErrorService } from '../services';

describe('FourOhFourComponent', () => {
  let component: FourOhFourComponent;
  let fixture: ComponentFixture<FourOhFourComponent>;
  let mockErrorService: jasmine.SpyObj<ErrorService>;

  beforeEach(waitForAsync(() => {
    mockErrorService = jasmine.createSpyObj('ErrorService', ['errorMessage']);
    mockErrorService.errorMessage.and.returnValue('Test error message');

    TestBed.configureTestingModule({
      imports: [FourOhFourComponent],
      providers: [{ provide: ErrorService, useValue: mockErrorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FourOhFourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display the error message from ErrorService', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const detailText = compiled.querySelector('.detail-text');
    expect(detailText).toBeTruthy();
    expect(detailText!.textContent).toContain('Test error message');
  });
});
