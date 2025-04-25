import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ErrorService } from '../services';

@Component({
  selector: 'app-four-oh-four',
  imports: [],
  templateUrl: './four-oh-four.component.html',
  styleUrl: './four-oh-four.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'component-container' },
})
export class FourOhFourComponent {
  private errorService = inject(ErrorService);
  readonly message = this.errorService.errorMessage;
}
