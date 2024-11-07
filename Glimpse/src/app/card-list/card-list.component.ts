import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { BackendGlueService } from '../services/backend-glue.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardListItem } from '../interfaces/backend.interface';
import { Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css'],
  standalone: true,
  imports: [HeaderComponent, CurrencyPipe, CommonModule],
})
export class CardListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private glue: BackendGlueService,
    private state: GlimpseStateService,
    private router: Router
  ) {}

  dummylist: CardListItem[] = [];
  totalPrice = 0.0;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.glue
      .getCardList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log('getCardList returned:', response);
        this.dummylist = response.list;
        this.totalPrice = response.currentTotal;
        this.state.pushNewTotal(response.currentTotal);
      });
  }

  onItemClick(item: CardListItem) {
    this.router.navigate(['/result', item.name]);
  }

  onClearList() {
    alert('Are you sure?');
    this.glue
      .deleteCardList()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log('deleteCardList returned:', response);
        this.dummylist = response.list;
        this.totalPrice = response.currentTotal;
        this.state.pushNewTotal(response.currentTotal);
      });
  }
}
