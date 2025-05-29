import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { CardSuggestionService } from '../services';
import { CardDisplayOnly } from '../interfaces';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  templateUrl: './suggestions.component.html',
  styleUrl: './suggestions.component.css',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'component-container' },
})
export class SuggestionsComponent implements OnInit {
  card_height = 204;
  card_width = 146;
  private readonly MIN_CARD_WIDTH = 179;
  private readonly PADDING_GAP = 24;

  private router = inject(Router);
  private suggests = inject(CardSuggestionService);
  readonly cards = this.suggests.cards;

  @HostBinding('style.--cols') cols = 1;

  @HostListener('window:resize')
  onResize() {
    this.updateCols();
  }

  ngOnInit(): void {
    this.updateCols();
  }

  private updateCols() {
    const numCards = this.cards().length;
    const screenWidth = window.innerWidth;
    // Mobile is always 2 columns or less
    if (screenWidth <= 600) {
      this.cols = Math.min(numCards, 2);
      return;
    }

    // determine how many columns we can fit based on the screen width
    const numCols = this.calcCols(screenWidth);

    // If it fits in one row, put them all in one row
    if (numCards <= numCols) {
      this.cols = numCards;
      return;
    }

    // otherwise, split evenly into rows
    let rows = 2;
    while (numCards / rows > numCols) {
      rows++;
    }
    this.cols = Math.ceil(numCards / rows);
  }

  private calcCols(width: number) {
    const oneColWidth = this.MIN_CARD_WIDTH + this.PADDING_GAP; // combine card width with left padding
    const widthMinusRightPadding = width - this.PADDING_GAP; // include the final right padding
    const numCols = Math.floor(widthMinusRightPadding / oneColWidth); // see how many cols fit comfortably
    return Math.max(numCols, 1); // always return at least 1 column
  }

  cardOnClick(card: CardDisplayOnly) {
    this.router.navigate(['/result', card.name]);
  }
}
