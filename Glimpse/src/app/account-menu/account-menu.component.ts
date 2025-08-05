import { Component, HostListener, inject, signal } from '@angular/core';
import { AuthService as AccountMenuService } from '../services';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-account-menu',
  imports: [],
  templateUrl: './account-menu.component.html',
  styleUrl: './account-menu.component.css',
})
export class AccountMenuComponent {
  private accountService = inject(AccountMenuService);
  private router = inject(Router);

  /** Signal to track menu open state */
  menuOpen = signal(false);

  /** Toggle the dropdown menu */
  toggleMenu() {
    this.menuOpen.update((open) => !open);
  }

  /** Close the dropdown menu when clicking outside of it. */
  @HostListener('document:click')
  onDocumentClick() {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
    }
  }

  /** Handle logout action */
  onLogout() {
    console.log('onLogout called');
    // this.accountService
    //   .logout()
    //   .pipe(
    //     takeUntilDestroyed(),
    //     // navigate after successful logout
    //     tap(() => this.router.navigate(['/login']))
    //   )
    //   .subscribe();
  }

  /** Handle account deletion */
  onDeleteAccount() {
    console.log('onDeleteAccount called');
    // this.accountService
    //   .deleteAccount()
    //   .pipe(
    //     takeUntilDestroyed(),
    //     tap(() => this.router.navigate(['/goodbye']))
    //   )
    //   .subscribe();
  }
}
