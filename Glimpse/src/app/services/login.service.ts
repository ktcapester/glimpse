import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);

  private _sent = signal<boolean>(false);
  readonly emailSent = this._sent.asReadonly();

  // This requests a magic link to be sent to the provided email.
  // It returns TRUE if the email is sent, FALSE if any error occurs.
  sendEmail(email: string) {
    this.http
      .post<{ success: boolean }>(`${environment.apiURL}/auth/magic-link`, {
        email,
      })
      .pipe(
        catchError((err) => {
          console.error('Trouble sending email:', err);
          return of({ success: false });
        }),
        tap((result) => this._sent.set(result.success))
      )
      .subscribe();
  }
}
