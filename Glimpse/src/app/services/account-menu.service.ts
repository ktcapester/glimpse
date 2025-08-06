import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LOGOUT_SUCCESS_STRING } from '@shared/constants';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountMenuService {
  constructor() {}
  private http = inject(HttpClient);

  async logout() {
    try {
      const response = await firstValueFrom(
        this.http.post<{ message: string }>(
          `${environment.apiURL}/auth/logout`,
          {
            withCredentials: true,
          }
        )
      );
      if (response.message === LOGOUT_SUCCESS_STRING) {
        return true;
      } else {
        console.log('Logout failed:', response.message);
        return false;
      }
    } catch (error) {
      console.log('Logout error:', error);
      return false;
    }
  }

  async deleteAccount() {
    try {
      const response = await firstValueFrom(
        this.http.delete<{ success: boolean }>(`${environment.apiURL}/user`, {
          withCredentials: true,
        })
      );
      return response.success;
    } catch (error) {
      console.log('Delete account error:', error);
      return false;
    }
  }
}
