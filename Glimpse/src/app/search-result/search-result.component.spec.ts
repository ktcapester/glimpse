import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { Component, Input, signal } from '@angular/core';
import {
  asyncScheduler,
  delay,
  mergeMap,
  of,
  scheduled,
  throwError,
} from 'rxjs';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { SearchResultComponent } from './search-result.component';
import { CardSchema, UserSchema } from '../interfaces';
import { SearchResultService, UserService, AuthService } from '../services';

/** Stub for the real CardDisplayComponent */
@Component({
  selector: 'app-card-display',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class StubCardDisplayComponent {
  @Input() card!: CardSchema | null;
}

describe('SearchResultComponent', () => {
  let component: SearchResultComponent;
  let fixture: ComponentFixture<SearchResultComponent>;

  let mockSearchResultService: jasmine.SpyObj<SearchResultService>;
  let mockUserService: { user: ReturnType<typeof signal> };
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Create a fake CardSchema to return from getCard()
  const fakeCard: CardSchema = {
    _id: 'card123',
    name: 'Test Card',
    prices: {
      calc: {
        usd: 2.5,
        usd_etched: 12.5,
        usd_foil: 4.5,
        eur: 2.5,
        eur_etched: 12.5,
        eur_foil: 4.5,
      },
      raw: undefined,
    },
    scryfallLink: 'https://scryfall.com/card/123',
    imgsrcFull: 'img-full',
    imgsrcSmall: 'img-small',
    createdAt: new Date(1111),
    updatedAt: new Date(1111),
  };

  beforeEach(waitForAsync(() => {
    mockSearchResultService = jasmine.createSpyObj('SearchResultService', {
      getCard: of(fakeCard),
      addCard: of(void 0),
    });
    mockUserService = { user: signal<UserSchema | null>(null) };
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    mockAuthService.isLoggedIn.and.returnValue(false);

    // Stub ActivatedRoute to supply a paramMap with cardName = 'test-card'
    const activatedRouteStub = {
      paramMap: of(convertToParamMap({ cardName: 'test-card' })),
    };

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        SearchResultComponent, // the standalone component under test
        StubCardDisplayComponent, // our stub for <app-card-display>
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SearchResultService, useValue: mockSearchResultService },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCard(...) with the correct cardName on init', () => {
    fixture.detectChanges(); // triggers ngOnInit
    expect(mockSearchResultService.getCard).toHaveBeenCalledWith('test-card');
  });

  it('after init, component.card should equal the fakeCard returned by the service', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit → subscribes to getCard
    // Simulate any microtask delay if needed
    tick();
    expect(component.card()).toEqual(fakeCard);
  }));

  it('when getCard(...) errors, should navigate to /404', fakeAsync(() => {
    // Arrange: make getCard throw
    mockSearchResultService.getCard.and.returnValue(
      scheduled([], asyncScheduler).pipe(
        mergeMap(() => throwError(() => new Error('Not Found')))
      )
    );
    fixture.detectChanges(); // ngOnInit
    tick(); // let the error propagate

    // this test is correctly failing now. i don't actually handle errors from getCard.

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/404']);
  }));

  it('should NOT call addCard(...) and should redirect to /login if user is NOT logged in', fakeAsync(() => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    fixture.detectChanges(); // initializes component.card
    tick(); // finish getCard

    // Assume your component has a method called onAddClick()
    component.onAddToList(fakeCard, component.user());
    tick();

    expect(mockSearchResultService.addCard).not.toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should call addCard(...) with the correct arguments if user IS logged in', fakeAsync(() => {
    // Suppose the UserService.signal yields a user with activeList = 'listABC'
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockUserService.user.set({
      _id: 'user123',
      username: 'foo',
      email: 'foo@example.com',
      activeList: 'listABC',
      // …other UserSchema fields…
    });

    // Stub addCard to return a successful Observable:
    mockSearchResultService.addCard.and.returnValue(
      of({ currentTotal: 0 }).pipe(delay(0))
    );

    fixture.detectChanges(); // ngOnInit: getCard
    tick(); // finish getCard
    // Now component.card === fakeCard

    // Call the “add” method
    component.onAddToList(fakeCard, component.user());
    tick(); // let addCard complete

    expect(mockSearchResultService.addCard).toHaveBeenCalledWith(
      fakeCard,
      'listABC'
    );
    // If your component navigates somewhere else after adding, assert that too. e.g.:
    // expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-collection']);
  }));
});
