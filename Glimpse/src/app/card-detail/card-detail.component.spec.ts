import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CardDetailComponent } from './card-detail.component';
import { CommonModule } from '@angular/common';
import { CardDisplayComponent } from '../card-display/card-display.component';
import { CardDetailService } from '../services/card-detail.service';
import { UserService } from '../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ParamMap as NgParamMap } from '@angular/router';

describe('CardDetailComponent', () => {
  let component: CardDetailComponent;
  let fixture: ComponentFixture<CardDetailComponent>;
  let mockCardDetailService: jasmine.SpyObj<CardDetailService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let activatedRouteStub: { paramMap: BehaviorSubject<NgParamMap> };
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    mockCardDetailService = jasmine.createSpyObj('CardDetailService', [
      'getCard',
      'updateCard',
      'deleteCard',
    ]);
    mockCardDetailService.getCard.and.returnValue(
      of({
        card: { _id: 'card123', prices: { calc: { usd: 10 } }, quantity: 5 },
      } as any)
    );
    mockCardDetailService.updateCard.and.returnValue(of({ currentTotal: 0 }));
    mockCardDetailService.deleteCard.and.returnValue(of({ currentTotal: 0 }));

    mockUserService = jasmine.createSpyObj('UserService', ['user']);
    mockUserService.user.and.returnValue({ activeList: 'list123' } as any);

    // Stub for ActivatedRoute.paramMap
    activatedRouteStub = {
      paramMap: new BehaviorSubject<NgParamMap>({
        get: () => 'card123',
      } as any),
    };

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [CommonModule, CardDisplayComponent],
      declarations: [CardDetailComponent],
      providers: [
        { provide: CardDetailService, useValue: mockCardDetailService },
        { provide: UserService, useValue: mockUserService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
      ],
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

  it('should initialize quantity based on cardDetail', () => {
    expect(component.quantity()).toBe(5);
  });

  it('increment should call updateCard and increase quantity', () => {
    component.increment();
    expect(mockCardDetailService.updateCard).toHaveBeenCalledWith(
      'list123',
      'card123',
      10,
      6
    );
    expect(component.quantity()).toBe(6);
  });

  it('decrement should call updateCard and decrease quantity', () => {
    component.decrement();
    expect(mockCardDetailService.updateCard).toHaveBeenCalledWith(
      'list123',
      'card123',
      10,
      4
    );
    expect(component.quantity()).toBe(4);
  });

  it('remove should call deleteCard and navigate', () => {
    component.remove();
    expect(mockCardDetailService.deleteCard).toHaveBeenCalledWith(
      'list123',
      'card123'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/list']);
  });
});
