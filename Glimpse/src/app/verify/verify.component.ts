import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerifyService } from '../services/verify.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-verify',
  standalone: true,
  templateUrl: './verify.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './verify.component.css',
})
export class VerifyComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private verify = inject(VerifyService);

  readonly hasResponse = this.verify.response;

  readonly templateText = computed(() => {
    let titleText = '';
    let subtitleText = '';
    let navigationText = '';
    if (!this.verify.response()) {
      // Waiting for response from the backend
      titleText = 'Verifying your login. . .';
      subtitleText = '';
      navigationText = '';
    } else {
      if (this.verify.success()) {
        // Case: Backend return successful login
        titleText = 'Login successful!';
        subtitleText = 'You can now view your saved cards.';
        navigationText = 'Go to list';
      } else {
        // Case: Backend failed to login
        titleText = 'Login failed, please try again.';
        subtitleText =
          'Try the link in your email again. If this problem persists, please request a new email.';
        navigationText = 'Back to sign in';
      }
    }
    return { titleText, subtitleText, navigationText };
  });

  private queryMapSignal = toSignal(this.route.queryParamMap);

  constructor() {
    effect(() => {
      // "/verify?token={token}&email={email}"
      const queryParams = this.queryMapSignal();
      if (queryParams) {
        const userToken = queryParams.get('token') || '';
        const userEmail = queryParams.get('email') || '';
        this.verify.validateToken(userEmail, userToken);
      }
    });
  }

  onClick() {
    if (this.verify.success()) {
      // link to list
      this.router.navigate(['/list']);
    } else {
      // link to sign up
      this.router.navigate(['/login']);
    }
  }
}
