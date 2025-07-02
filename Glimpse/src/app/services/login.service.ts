import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);

  private _sent = signal<boolean>(false);
  readonly emailSent = this._sent.asReadonly();

  // This requests a magic link to be sent to the provided email.
  // It returns TRUE if the email is sent, FALSE if any error occurs.
  async sendEmail(email: string) {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean }>(
          `${environment.apiURL}/link/magic-link`,
          {
            email,
          }
        )
      );
      this._sent.set(response.success);
    } catch (error) {
      console.error('sendEmail error:', error);
      this._sent.set(false);
    }
  }
}
