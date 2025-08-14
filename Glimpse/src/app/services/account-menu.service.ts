import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
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
      if (response.message === 'Logged out') {
        return true;
      } else {
        console.error('Logout failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Logout error:', error);
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
      console.error('Delete account error:', error);
      return false;
    }
  }
}
