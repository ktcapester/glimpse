import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsenseAdComponent } from './adsense-ad.component';

describe('AdsenseAdComponent', () => {
  let component: AdsenseAdComponent;
  let fixture: ComponentFixture<AdsenseAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdsenseAdComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdsenseAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
