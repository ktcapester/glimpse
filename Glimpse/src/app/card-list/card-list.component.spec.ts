import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { asyncScheduler, of, scheduled, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { CardListComponent } from './card-list.component';
import { UserService } from '../services/user.service';
import { CardListService } from '../services/card-list.service';

describe('CardListComponent', () => {
  let component: CardListComponent;
  let fixture: ComponentFixture<CardListComponent>;

  // Mocked dependencies
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockCardListService: jasmine.SpyObj<CardListService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const dummyListResponse = {
    list: [
      { id: 'cardA', name: 'Card A', price: 2, count: 3 },
      { id: 'cardB', name: 'Card B', price: 5, count: 1 },
    ],
    currentTotal: 11,
  };

  beforeEach(waitForAsync(() => {
    // Default mock implementations
    mockUserService = jasmine.createSpyObj('UserService', ['user']);
    mockUserService.user.and.returnValue({ activeList: 'list123' } as any);

    mockCardListService = jasmine.createSpyObj('CardListService', [
      'getList',
      'deleteList',
    ]);
    mockCardListService.getList.and.returnValue(
      of(dummyListResponse).pipe(delay(0))
    );
    mockCardListService.deleteList.and.returnValue(
      of(dummyListResponse).pipe(delay(0))
    );

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [CardListComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: CardListService, useValue: mockCardListService },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(CardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch list data on init when activeList is present', fakeAsync(() => {
    // At this point, mockUserService.user() returns { activeList: 'list123' }
    fixture.detectChanges(); // triggers ngOnInit and effect

    expect(mockUserService.user).toHaveBeenCalled();
    expect(mockCardListService.getList).toHaveBeenCalledWith('list123');
    tick(); // allow any async work to complete
    // The signal listData should now hold dummyListResponse
    expect(component.listData()).toEqual(dummyListResponse);
  }));

  it('should navigate to detail page when onItemClick is called', () => {
    const testId = 'cardA';
    const testName = 'Card A';
    component.onItemClick(testId, testName);
    expect(routerSpy.navigate).toHaveBeenCalledWith([
      '/detail',
      testId,
      testName,
    ]);
  });

  it('should open modal when onClearList is called', () => {
    // Initially isModalActive signal is false
    expect(component.isModalActive()).toBeFalse();

    component.onClearList();
    expect(component.isModalActive()).toBeTrue();
  });

  it('should close modal when onCancel is called', () => {
    // Pre-set isModalActive to true
    component.isModalActive.set(true);
    expect(component.isModalActive()).toBeTrue();

    component.onCancel();
    expect(component.isModalActive()).toBeFalse();
  });

  it('should delete list and update listData, then close modal and reset isDeleting', fakeAsync(() => {
    // Pre-set modal to active so onConfirm can proceed
    component.isModalActive.set(true);
    // Spy deleteList returns dummyListResponse
    component.onConfirm();

    // Immediately after calling onConfirm, isDeleting should be true
    expect(component.isDeleting()).toBeTrue();
    expect(mockCardListService.deleteList).toHaveBeenCalledWith('list123');

    tick(); // wait for the observable to emit and finalize

    // After the operation completes:
    expect(component.listData()).toEqual(dummyListResponse);
    expect(component.isModalActive()).toBeFalse();
    expect(component.isDeleting()).toBeFalse();
  }));

  it('should handle error in deleteList gracefully and reset isDeleting', fakeAsync(() => {
    // This is supposed to make the error run asyncly, but it refuses to work.
    // So we have to use the verbose method following this.
    // mockCardListService.deleteList.and.returnValue(
    //   defer(() => throwError(() => new Error('Delete failed'))).pipe(
    //     delay(0) // by default, delay(0) uses asyncScheduler
    //   )
    // );

    // Override deleteList(...) to throw on the next microtask:
    mockCardListService.deleteList.and.returnValue(
      scheduled([], asyncScheduler).pipe(
        mergeMap(() => throwError(() => new Error('Delete failed')))
      )
    );

    component.isModalActive.set(true);
    component.onConfirm();

    // At this point:
    // - The component’s initial getList() is still pending (delay(0)).
    // - deleteList() is pending (delay(0)).
    // So isDeleting() === true.
    expect(component.isDeleting()).toBeTrue();
    expect(mockCardListService.deleteList).toHaveBeenCalledWith('list123');

    // Advance past both delay(0) emissions:
    tick();

    // Now:
    //  • initial getList() has populated listData()
    //  • deleteList() errored → catchError(() => EMPTY) → finalize() → isDeleting(false)
    expect(component.isDeleting()).toBeFalse();
    expect(component.isModalActive()).toBeTrue();
    // listData should remain unchanged from init value
    expect(component.listData()).toEqual(dummyListResponse);
  }));
});
