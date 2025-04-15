import { Component } from '@angular/core';

@Component({
  selector: 'app-no-results',
  standalone: true,
  templateUrl: './no-results.component.html',
  styleUrl: './no-results.component.css',
  host: { class: 'component-container' },
})
export class NoResultsComponent {
  message = 'No cards found with that name.';
}
