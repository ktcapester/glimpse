import { Component } from '@angular/core';
import { CardListItem } from '../interfaces/backend.interface';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.css',
})
export class CardDetailComponent {
  onItemIncrease(item: CardListItem) {
    item.count += 1;
    this.updateBackend();
  }

  onItemDecrease(item: CardListItem) {
    // sanity check, technically the item should delete if it gets to 0...
    // but then how do we handle accidentally clicking to 0
    if (item.count > 0) {
      item.count -= 1;
    }
    if (item.count === 0) {
      this.onItemRemove(item);
    } else {
      this.updateBackend();
    }
  }

  onItemRemove(item: CardListItem) {
    this.updateBackend();
  }

  private updateBackend() {}
}
