import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { CurrentTotalService } from './current-total.service';
import { UserService } from './user.service';
import { CardListService } from './card-list.service';

describe('CurrentTotalService', () => {
  let mockUserService: any;
  let mockCardListService: any;

  beforeEach(() => {
    mockUserService = {
      // user() returns an object with activeList set
      user: () => ({ activeList: 'test-list-id' }),
    };

    mockCardListService = jasmine.createSpyObj('CardListService', ['getList']);
    mockCardListService.getList.and.returnValue(
      // any observable is fine; effect only cares that .subscribe() is called
      of({ list: [], currentTotal: 0 })
    );

    TestBed.configureTestingModule({
      providers: [
        CurrentTotalService,
        { provide: UserService, useValue: mockUserService },
        { provide: CardListService, useValue: mockCardListService },
      ],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(CurrentTotalService);
    expect(service).toBeTruthy();
  });

  it('should call getList when user has activeList', fakeAsync(() => {
    TestBed.inject(CurrentTotalService);
    tick();
    expect(mockCardListService.getList).toHaveBeenCalledWith('test-list-id');
  }));

  it('setTotal should update total signal', () => {
    const service = TestBed.inject(CurrentTotalService);
    service.setTotal(123);
    expect(service.total()).toBe(123);
  });

  it('should reset total to 0 when user has no activeList', fakeAsync(() => {
    // Reconfigure UserService to return null (no activeList)
    TestBed.resetTestingModule();

    mockUserService = {
      user: () => null,
    };
    mockCardListService = jasmine.createSpyObj('CardListService', ['getList']);
    mockCardListService.getList.and.returnValue(
      of({ list: [], currentTotal: 0 })
    );

    TestBed.configureTestingModule({
      providers: [
        CurrentTotalService,
        { provide: UserService, useValue: mockUserService },
        { provide: CardListService, useValue: mockCardListService },
      ],
    });

    const service = TestBed.inject(CurrentTotalService);
    tick();
    expect(service.total()).toBe(0);
    // Ensure getList was never called in this scenario
    expect(mockCardListService.getList).not.toHaveBeenCalled();
  }));
});
