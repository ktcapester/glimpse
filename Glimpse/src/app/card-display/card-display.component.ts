import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardSchema } from '../interfaces';

@Component({
  selector: 'app-card-display',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './card-display.component.html',
  styleUrl: './card-display.component.css',
  host: { class: 'component-container' },
})
export class CardDisplayComponent {
  @Input({ required: true }) card: CardSchema | null = null;

  @Input() loadingText = 'Loading card details...';
}
