import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { EMPTY, Observable } from 'rxjs';
import { catchError, first, switchMap, tap } from 'rxjs/operators';
import { UserSchema } from '../interfaces/schemas.interface';
import { ListData } from '../interfaces/list-data';
import { Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { UserService } from '../services/user.service';
import { CardListService } from '../services/card-list.service';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css'],
  standalone: true,
  imports: [CurrencyPipe, CommonModule],
  host: { class: 'component-container' },
})
export class CardListComponent implements OnInit {
  listData$!: Observable<ListData>;
  isModalActive = false;
  isDeleting = false;

  constructor(
    private state: GlimpseStateService,
    private router: Router,
    private listService: CardListService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadList();
  }

  private loadList() {
    // Use the current User to get the active list.
    this.listData$ = this.userService.user$.pipe(
      first((u): u is UserSchema => u !== null),
      switchMap((user) => this.listService.getList(user.activeList))
    );
  }

  onItemClick(id: string, name: string) {
    this.router.navigate(['/detail', id, name]);
  }

  onClearList() {
    this.isModalActive = true;
  }

  onCancel() {
    this.isModalActive = false;
  }

  onConfirm() {
    this.isDeleting = true;
    this.userService.user$
      .pipe(
        first((u): u is UserSchema => u !== null),
        switchMap((user) =>
          this.listService.deleteList(user.activeList).pipe(
            tap((foo) => {
              this.isModalActive = false;
              this.loadList();
              this.state.pushNewTotal(foo);
            }),
            catchError((err) => {
              console.log('Delete failed', err);
              return EMPTY;
            })
          )
        )
      )
      .subscribe({ complete: () => (this.isDeleting = false) });
  }
}
