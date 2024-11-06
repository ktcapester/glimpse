import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { BackendGlueService } from '../services/backend-glue.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardListItem } from '../interfaces/backend.interface';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css'],
  standalone: true,
  imports: [HeaderComponent, CurrencyPipe, CommonModule],
})
export class CardListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private glue: BackendGlueService) {}

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
      .subscribe((list) => {
        this.dummylist = list;
        for (let index = 0; index < list.length; index++) {
          const element = list[index];
          this.totalPrice += element.price;
        }
      });
  }

  onClearList() {
    alert('Are you sure?');
  }
}
