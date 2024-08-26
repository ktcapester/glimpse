import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-four-oh-four',
  standalone: true,
  imports: [],
  templateUrl: './four-oh-four.component.html',
  styleUrl: './four-oh-four.component.css',
})
export class FourOhFourComponent implements OnInit {
  @Input() message = 'Default 404 message';

  ngOnInit(): void {
    if (!this.message) {
      this.message = 'Default 404 message';
    }
  }
}
