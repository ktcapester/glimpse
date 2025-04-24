import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GlimpseStateService } from '../services/glimpse-state.service';

@Component({
  selector: 'app-four-oh-four',
  imports: [],
  templateUrl: './four-oh-four.component.html',
  styleUrl: './four-oh-four.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'component-container' },
})
export class FourOhFourComponent {
  private stateService = inject(GlimpseStateService);
  readonly message = this.stateService.errorMessage;
}
