import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EMPTY } from 'rxjs';
import { catchError, finalize, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ListData } from '../interfaces';
import { UserService, CardListService } from '../services';
import { AdsenseAdComponent } from '../adsense-ad/adsense-ad.component';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css'],
  imports: [CommonModule, AdsenseAdComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'component-container' },
})
export class CardListComponent {
  private router = inject(Router);
  private listService = inject(CardListService);
  private userService = inject(UserService);

  private _listSig = signal<ListData | null>(null);
  readonly listData = this._listSig.asReadonly();

  private readonly listId = computed(
    () => this.userService.user()?.activeList ?? ''
  );

  constructor() {
    effect(() => {
      const id = this.listId();
      if (!id) {
        this._listSig.set(null);
        return;
      }
      this.listService
        .getList(id)
        .pipe(
          take(1), // explicitly take only the first emission (overkill due to HTTPClient)
          tap((resp) => {
            console.log('[CardList] fetch response:', resp);
            this._listSig.set(resp);
          })
        )
        .subscribe();
    });
  }

  readonly isModalActive = signal(false);
  readonly isDeleting = signal(false);

  onItemClick(id: string, name: string) {
    this.router.navigate(['/detail', id, name]);
  }

  onClearList() {
    this.isModalActive.set(true);
  }

  onCancel() {
    this.isModalActive.set(false);
  }

  onConfirm() {
    this.isDeleting.set(true);
    this.listService
      .deleteList(this.listId())
      .pipe(
        tap((response) => {
          this._listSig.set(response);
          this.isModalActive.set(false);
        }),
        catchError(() => EMPTY),
        finalize(() => this.isDeleting.set(false))
      )
      .subscribe();
  }
}
