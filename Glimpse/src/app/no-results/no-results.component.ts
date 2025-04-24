import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-results',
  standalone: true,
  templateUrl: './no-results.component.html',
  styleUrl: './no-results.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'component-container' },
})
export class NoResultsComponent {
  message = 'No cards found with that name.';
  // route is '/none/:term'
  // search bar should have pulled :term out and show it there
  // so what should be in here?
}
