import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { SuggestionsComponent } from './suggestions.component';
import { CardDisplayOnly } from '../interfaces';
import { CardSuggestionService } from '../services';

// Stub for CardSuggestionService
class StubCardSuggestionService {
  // Initialize with an empty array; tests can override this.cardsSignal.set([...])
  private cardsSignal = signal<CardDisplayOnly[]>([]);
  readonly cards = this.cardsSignal.asReadonly();

  setCards(cards: CardDisplayOnly[]) {
    this.cardsSignal.set(cards);
  }
}

describe('SuggestionsComponent', () => {
  let fixture: ComponentFixture<SuggestionsComponent>;
  let component: SuggestionsComponent;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockSuggestionSvc: jasmine.SpyObj<CardSuggestionService>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockSuggestionSvc = jasmine.createSpyObj('CardSuggestionService', [
      'cards',
    ]);

    TestBed.configureTestingModule({
      imports: [SuggestionsComponent, NgOptimizedImage],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CardSuggestionService, useValue: mockSuggestionSvc },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestionsComponent);
    component = fixture.componentInstance;
  }));

  afterEach(() => {
    // Reset any window modifications
    // (optional cleanup; JSDOM resets window between test suites in most setups)
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set cols equal to number of cards when screen width <= 600', fakeAsync(() => {
    // Arrange: stub two cards
    const exampleCards: CardDisplayOnly[] = [
      { name: 'Alpha', imgsrc: 'url1' } as CardDisplayOnly,
      { name: 'Beta', imgsrc: 'url2' } as CardDisplayOnly,
    ];
    mockSuggestionSvc.cards.and.returnValue(exampleCards);

    // Override window.innerWidth to simulate small screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    // Act: Initialize and run lifecycle
    fixture.detectChanges(); // triggers ngOnInit -> updateCols
    tick();

    // Assert: Since screenWidth <= 600, cols = min(numCards, 2) = 2
    expect(component.cols).toBe(2);
  }));

  it('should calculate cols correctly for larger screens', fakeAsync(() => {
    // Arrange: stub three cards
    const exampleCards: CardDisplayOnly[] = [
      { name: 'One', imgsrc: 'url1' } as CardDisplayOnly,
      { name: 'Two', imgsrc: 'url2' } as CardDisplayOnly,
      { name: 'Three', imgsrc: 'url3' } as CardDisplayOnly,
    ];
    mockSuggestionSvc.cards.and.returnValue(exampleCards);

    // Choose a window width that will fit exactly 2 columns:
    // The component uses MIN_CARD_WIDTH = 179, PADDING_GAP = 24
    // oneColWidth = 179 + 24 = 203
    // widthMinusRightPadding = width - 24
    // numCols = floor((width - 24) / 203)
    // For width = 450: (450 - 24) / 203 ≈ 2.07 → floor = 2
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 450,
    });

    // Act
    fixture.detectChanges(); // ngOnInit -> updateCols
    tick();

    // There are 3 cards, numCols = 2 → needs at least 2 rows:
    // rows=2 → 3/2 = 1.5 <= 2, so cols = ceil(3/2) = 2
    expect(component.cols).toBe(2);
  }));

  it('should recalculate cols on window resize', fakeAsync(() => {
    // Arrange: stub four cards
    const exampleCards: CardDisplayOnly[] = [
      { name: 'A', imgsrc: 'url1' } as CardDisplayOnly,
      { name: 'B', imgsrc: 'url2' } as CardDisplayOnly,
      { name: 'C', imgsrc: 'url3' } as CardDisplayOnly,
      { name: 'D', imgsrc: 'url4' } as CardDisplayOnly,
    ];
    mockSuggestionSvc.cards.and.returnValue(exampleCards);

    // Initial width: small screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    fixture.detectChanges();
    tick();
    // Screen <= 600 → cols = min(4, 2) = 2
    expect(component.cols).toBe(2);

    // Now simulate larger screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });
    // Dispatch resize event
    window.dispatchEvent(new Event('resize'));
    tick();

    // Recalculate: oneColWidth=203, (800-24)/203 ≈ 3.82 → numCols = 3
    // numCards = 4; numCols = 3; since 4 > 3, start with rows=2: 4/2=2 <=3 → cols=ceil(4/2)=2
    expect(component.cols).toBe(2);

    // Simulate an even wider screen so all cards fit in one row
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    window.dispatchEvent(new Event('resize'));
    tick();

    // (1000 - 24) / 203 ≈ 4.79 → numCols = 4; numCards=4 <= 4 → cols=4
    expect(component.cols).toBe(4);
  }));

  it("should navigate to '/result/:name' when a card is clicked", () => {
    // Arrange: stub a single card
    const singleCard: CardDisplayOnly = {
      name: 'FooCard',
      imgsrc: 'foo.png',
    } as CardDisplayOnly;

    // Act: call cardOnClick directly
    component.cardOnClick(singleCard);

    // Assert
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/result', 'FooCard']);
  });
});
