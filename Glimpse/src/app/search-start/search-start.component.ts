import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-search-start',
  templateUrl: './search-start.component.html',
  styleUrls: ['./search-start.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchBarComponent, NgOptimizedImage],
})
export class SearchStartComponent {
  // There probably should be *some* kind of logic in this component lol
}
