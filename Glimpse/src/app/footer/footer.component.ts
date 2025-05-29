import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  // this is where ads will live or something i guess
  minSize = input('footer-min');
}
