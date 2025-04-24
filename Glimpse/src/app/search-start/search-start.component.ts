import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-search-start',
  templateUrl: './search-start.component.html',
  styleUrls: ['./search-start.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchBarComponent],
})
export class SearchStartComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
