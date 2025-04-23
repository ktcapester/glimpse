import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CardSuggestionService } from '../services/card-suggestion.service';
import { CardDisplayOnly } from '../interfaces/backend.interface';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  templateUrl: './suggestions.component.html',
  styleUrl: './suggestions.component.css',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'component-container' },
})
export class SuggestionsComponent {
  card_height = 204;
  card_width = 146;

  private router = inject(Router);
  private suggests = inject(CardSuggestionService);
  readonly cards = this.suggests.cards;

  cardOnClick(card: CardDisplayOnly) {
    this.router.navigate(['/result', card.name]);
  }
}
