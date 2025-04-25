import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { EMPTY, Observable } from 'rxjs';
import { catchError, first, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserSchema, ListData } from '../interfaces';
import { UserService, CardListService } from '../services';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css'],
  imports: [CurrencyPipe, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'component-container' },
})
export class CardListComponent implements OnInit {
  private router = inject(Router);
  private listService = inject(CardListService);
  private userService = inject(UserService);

  listData$!: Observable<ListData>;
  isModalActive = false;
  isDeleting = false;

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
            tap(() => {
              this.isModalActive = false;
              this.loadList();
            }),
            catchError(() => {
              return EMPTY;
            })
          )
        )
      )
      .subscribe({ complete: () => (this.isDeleting = false) });
  }
}
