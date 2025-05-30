import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardDetailComponent } from './card-detail.component';

describe('CardDetailComponent', () => {
  let component: CardDetailComponent;
  let fixture: ComponentFixture<CardDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CardDetailComponent],
      // imports: [MyComponent, HttpClientTestingModule, RouterTestingModule, ...]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
