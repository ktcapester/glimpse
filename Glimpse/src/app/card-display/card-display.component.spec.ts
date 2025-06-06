import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardDisplayComponent } from './card-display.component';
import { By } from '@angular/platform-browser';
import { CardSchema } from '../interfaces';

describe('CardDisplayComponent', () => {
  let component: CardDisplayComponent;
  let fixture: ComponentFixture<CardDisplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CardDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display card details when card is provided (including etched price)', () => {
    const mockCard: CardSchema = {
      _id: 'card123',
      name: 'Test Card',
      imgsrcFull: 'http://example.com/test-image.jpg',
      prices: {
        calc: {
          usd: 1.23,
          usd_foil: 2.34,
          usd_etched: 3.45,
        },
      },
      // ...other properties can be omitted for this test
    } as any;

    component.card = mockCard;
    fixture.detectChanges();

    // Image should render with alt equal to card.name
    const imgEl = fixture.debugElement.query(By.css('img'));
    expect(imgEl).toBeTruthy();
    expect(imgEl.attributes['alt']).toBe('Test Card');

    // There should be three label elements: "Normal", "Foil", "Etched"
    const labelEls = fixture.debugElement.queryAll(By.css('.text.label'));
    const labelTexts = labelEls.map((el) =>
      el.nativeElement.textContent.trim()
    );
    expect(labelTexts).toEqual(['Normal', 'Foil', 'Etched']);

    // There should be three value elements with correct currency formatting
    const valueEls = fixture.debugElement.queryAll(By.css('.text.value'));
    const valueTexts = valueEls.map((el) =>
      el.nativeElement.textContent.trim()
    );
    expect(valueTexts.some((text) => text.includes('1.23'))).toBeTrue();
    expect(valueTexts.some((text) => text.includes('2.34'))).toBeTrue();
    expect(valueTexts.some((text) => text.includes('3.45'))).toBeTrue();
  });

  it('should display only normal and foil prices when usd_etched is absent', () => {
    const mockCardNoEtched: CardSchema = {
      _id: 'card456',
      name: 'Another Card',
      imgsrcFull: 'http://example.com/another-image.jpg',
      prices: {
        calc: {
          usd: 5.67,
          usd_foil: 8.9,
          // usd_etched is undefined
        },
      },
    } as any;

    component.card = mockCardNoEtched;
    fixture.detectChanges();

    // Check that etched label is not rendered
    const etchedLabelEl = fixture.debugElement.query(
      By.css('.text.label:nth-child(3)')
    );
    expect(etchedLabelEl).toBeNull();

    // Only two labels: "Normal" and "Foil"
    const labelEls = fixture.debugElement.queryAll(By.css('.text.label'));
    const labelTexts = labelEls.map((el) =>
      el.nativeElement.textContent.trim()
    );
    expect(labelTexts).toEqual(['Normal', 'Foil']);

    // Only two price values (usd and usd_foil)
    const valueEls = fixture.debugElement.queryAll(By.css('.text.value'));
    const valueTexts = valueEls.map((el) =>
      el.nativeElement.textContent.trim()
    );
    expect(valueTexts.some((text) => text.includes('5.67'))).toBeTrue();
    expect(valueTexts.some((text) => text.includes('8.90'))).toBeTrue();
    expect(valueTexts.length).toBe(2);
  });
});
