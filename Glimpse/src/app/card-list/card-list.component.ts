import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit {

  constructor() { }

  dummylist = [1,2,3,4,5,6,7,8,9,9]

  ngOnInit(): void {
  }

}
