import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { BackendGlueService } from '../services/backend-glue.service';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CardListItem } from '../interfaces/backend.interface';
import { UserSchema } from '../interfaces/schemas.interface';
import { Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css'],
  standalone: true,
  imports: [HeaderComponent, CurrencyPipe, CommonModule],
})
export class CardListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  myUser!: UserSchema;

  constructor(
    private glue: BackendGlueService,
    private state: GlimpseStateService,
    private router: Router,
    private userService: UserService
  ) {}

  displayList: CardListItem[] = [];
  totalPrice = 0.0;
  isModalActive = false;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.userService.user$
      .pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          if (data) {
            this.myUser = data;
          }
        })
      )
      .subscribe();

    this.glue
      .getCardList(this.myUser.activeList)
      .pipe(
        takeUntil(this.destroy$),
        tap((response) => {
          this.displayList = response.list;
          this.totalPrice = response.currentTotal;
          this.state.pushNewTotal(response.currentTotal);
        })
      )
      .subscribe();
  }

  onItemClick(item: CardListItem) {
    this.router.navigate(['/detail', item.id, item.name]);
  }

  onClearList() {
    if (this.displayList.length) {
      this.isModalActive = true;
    }
  }

  onCancel() {
    this.isModalActive = false;
  }

  onConfirm() {
    this.glue
      .deleteCardList(this.myUser.activeList)
      .pipe(
        takeUntil(this.destroy$),
        tap((response) => {
          this.displayList = response.list;
          this.totalPrice = response.currentTotal;
          this.state.pushNewTotal(response.currentTotal);
          this.isModalActive = false;
        })
      )
      .subscribe();
  }
}
