import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-no-results',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './no-results.component.html',
  styleUrl: './no-results.component.css',
})
export class NoResultsComponent {
  message = 'No cards found with that name.';
}
