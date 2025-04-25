import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-search-start',
  templateUrl: './search-start.component.html',
  styleUrls: ['./search-start.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchBarComponent, NgOptimizedImage],
})
export class SearchStartComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
