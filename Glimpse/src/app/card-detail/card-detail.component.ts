import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { combineLatest, Observable } from 'rxjs';
import { filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import { CardDetailService } from '../services/card-detail.service';
import { UserService } from '../services/user.service';
import { CardSchema, UserSchema } from '../interfaces/schemas.interface';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.css',
  host: { class: 'component-container' },
})
export class CardDetailComponent implements OnInit {
  cardDetail$!: Observable<{
    card: CardSchema;
    quantity: number;
    listID: string;
  }>;
  isPatching = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private state: GlimpseStateService,
    private details: CardDetailService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Use the URL and the current User to get the details we need.
    this.cardDetail$ = combineLatest([
      this.userService.user$.pipe(filter((u): u is UserSchema => u !== null)), // make sure User is logged in
      this.route.paramMap.pipe(map((pm) => pm.get('cardID')!)),
    ]).pipe(
      switchMap(([user, cardID]) =>
        this.details.getCard(user.activeList, cardID).pipe(
          map((v) => {
            return { ...v, listID: user.activeList };
          })
        )
      )
    );
  }

  onItemIncrease(detail: {
    card: CardSchema;
    quantity: number;
    listID: string;
  }) {
    if (detail.quantity < 99) {
      const newCount = detail.quantity + 1;
      this.isPatching = true;
      this.details
        .updateCard(
          detail.listID,
          detail.card._id,
          detail.card.prices?.calc?.usd || 0,
          newCount
        )
        .pipe(
          tap((res) => this.state.pushNewTotal(res)),
          finalize(() => (this.isPatching = false))
        )
        .subscribe();
    }
  }

  onItemDecrease(detail: {
    card: CardSchema;
    quantity: number;
    listID: string;
  }) {
    if (detail.quantity > 1) {
      const newCount = detail.quantity - 1;
      this.isPatching = true;
      this.details
        .updateCard(
          detail.listID,
          detail.card._id,
          detail.card.prices?.calc?.usd || 0,
          newCount
        )
        .pipe(
          tap((res) => this.state.pushNewTotal(res)),
          finalize(() => (this.isPatching = false))
        )
        .subscribe();
    }
  }

  onItemRemove(detail: { card: CardSchema; quantity: number; listID: string }) {
    this.isPatching = true;
    this.details
      .deleteCard(detail.listID, detail.card._id)
      .pipe(
        tap(() => this.router.navigate(['/list'])),
        finalize(() => (this.isPatching = false))
      )
      .subscribe();
  }
}
