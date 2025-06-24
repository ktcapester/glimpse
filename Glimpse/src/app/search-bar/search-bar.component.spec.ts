import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  convertToParamMap,
  ParamMap,
  UrlSegment,
} from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CardSearchService } from '../services/card-search.service';
import { CardSuggestionService } from '../services/card-suggestion.service';
import { UserService } from '../services/user.service';
import { CurrentTotalService } from '../services/current-total.service';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  // Spies / mocks
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let mockCardSearchService: jasmine.SpyObj<CardSearchService>;
  let mockSuggestionService: jasmine.SpyObj<CardSuggestionService>;
  let mockUserService: Partial<UserService>;
  let mockTotalService: Partial<CurrentTotalService>;

  // For simulating router events
  let routerEvents$: Subject<NavigationEnd>;

  beforeEach(waitForAsync(() => {
    // Stub Router with a 'navigate' spy and a fake 'events' observable
    routerEvents$ = new Subject<NavigationEnd>();
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate'], {
      events: routerEvents$.asObservable(),
    });

    activatedRouteSpy = jasmine.createSpyObj<ActivatedRoute>(
      'ActivatedRoute',
      /* no methods to spy on */ [],
      /* declare these four “properties” */ [
        'root',
        'firstChild',
        'paramMap',
        'snapshot',
      ]
    );

    //––– Now “shape” those four properties so that the component’s ngOnInit() can run without TS or runtime errors:

    // a) paramMap must be an Observable<ParamMap> (the component does route.paramMap.pipe(...) but we never subscribe in tests)
    (activatedRouteSpy.paramMap as any) = of<ParamMap>(convertToParamMap({}));

    // b) snapshot must at least have a `url: UrlSegment[]` array, because the component reads `route.snapshot.url[0]`.
    //    We can give it an empty‐array so that `route.snapshot.url[0]` is undefined (and the component returns early).
    (activatedRouteSpy.snapshot as any) = {
      url: [] as UrlSegment[],
      paramMap: convertToParamMap({}),
      queryParamMap: convertToParamMap({}),
      // We can skip the rest of ActivatedRouteSnapshot properties because TS is already “fooled” by casting to `any`.
    };

    // c) root/firstChild: In ngOnInit(), the code does:
    //      let route = this.route.root;
    //      while(route.firstChild) { route = route.firstChild; }
    //    So `root` must point to some ActivatedRoute‐like object (we can point it back to activatedRouteSpy)
    //    and `firstChild` can be null so that the loop stops immediately.
    (activatedRouteSpy.root as any) = activatedRouteSpy;
    (activatedRouteSpy.firstChild as any) = null;

    // Mock CardSearchService
    mockCardSearchService = jasmine.createSpyObj('CardSearchService', [
      'searchForCard',
    ]);

    // Mock CardSuggestionService
    mockSuggestionService = jasmine.createSpyObj('CardSuggestionService', [
      'updateSuggestions',
    ]);

    // Mock UserService: provide a 'user' signal
    mockUserService = {
      user: signal<{ activeList?: string } | null>(null) as UserService['user'],
    };

    // Mock CurrentTotalService: provide a 'total' signal (returned but not used in tests)
    mockTotalService = {
      total: signal<number>(123) as CurrentTotalService['total'],
    };

    TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: CardSearchService, useValue: mockCardSearchService },
        { provide: CardSuggestionService, useValue: mockSuggestionService },
        { provide: UserService, useValue: mockUserService },
        { provide: CurrentTotalService, useValue: mockTotalService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should not navigate if search form is invalid', () => {
    // Initially, the form is empty => invalid (required + minLength(3))
    component.handleSubmit();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to suggestions when multiple cards are returned', fakeAsync(() => {
    // Make form valid
    component.searchForm.setValue({ search: 'abc' });

    const dummyList = [
      { name: 'Card A', imgsrc: 'a-img', scryfallLink: 'a-link' },
      { name: 'Card B', imgsrc: 'b-img', scryfallLink: 'b-link' },
    ];

    // Stub searchForCard to return an array of length > 1
    mockCardSearchService.searchForCard.and.returnValue(of(dummyList));
    // Call handleSubmit()
    component.handleSubmit();
    // Flush microtasks so that subscribe() callback runs
    tick();
    expect(mockSuggestionService.updateSuggestions).toHaveBeenCalledWith(
      dummyList
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/suggestions', 'abc']);
  }));

  it('should navigate to result when exactly one card is returned', fakeAsync(() => {
    component.searchForm.setValue({ search: 'uniqueCard' });

    mockCardSearchService.searchForCard.and.returnValue(
      of([
        {
          name: 'UniqueCardName',
          imgsrc: 'unique-img',
          scryfallLink: 'unique-link',
        },
      ])
    );
    component.handleSubmit();
    tick();
    expect(mockSuggestionService.updateSuggestions).not.toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith([
      '/result',
      'UniqueCardName',
    ]);
  }));

  it('should navigate to none when zero cards are returned', fakeAsync(() => {
    component.searchForm.setValue({ search: 'noCard' });

    mockCardSearchService.searchForCard.and.returnValue(of([]));
    component.handleSubmit();
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/none', 'noCard']);
  }));

  it('should navigate to 404 on error', fakeAsync(() => {
    component.searchForm.setValue({ search: 'errorCase' });

    // Make searchForCard throw an error
    mockCardSearchService.searchForCard.and.returnValue(
      throwError(() => new Error('Network error'))
    );
    component.handleSubmit();
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/404']);
  }));

  describe('navigateToList()', () => {
    it('should navigate to /list when user has an activeList', () => {
      // Set the user signal to have an activeList
      (mockUserService!.user as any).set({ activeList: 'list123' });
      component.navigateToList();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/list']);
    });

    it('should navigate to /login when user has no activeList', () => {
      (mockUserService!.user as any).set(null);
      component.navigateToList();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
