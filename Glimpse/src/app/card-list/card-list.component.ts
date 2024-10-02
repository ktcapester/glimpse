import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css'],
  standalone: true,
  imports: [HeaderComponent],
})
export class CardListComponent implements OnInit {
  constructor() {}

  dummylist = [1, 2, 3, 4, 5, 6, 7, 8, 9, 9];

  ngOnInit(): void {}
}
