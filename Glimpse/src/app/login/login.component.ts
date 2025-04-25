import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../services';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './login.component.css',
  host: { class: 'component-container' },
})
export class LoginComponent {
  searchForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  private login = inject(LoginService);
  readonly isEmailSent = this.login.emailSent;

  handleSubmit() {
    if (this.searchForm.invalid) {
      // do nothing so they stay on the page
      return;
    }
    let the_email = this.searchForm.value.email
      ? this.searchForm.value.email
      : '';
    this.login.sendEmail(the_email);
  }
}
