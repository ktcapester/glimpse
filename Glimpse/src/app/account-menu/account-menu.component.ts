import { Component, HostListener, inject, signal } from '@angular/core';
import { AccountMenuService } from '../services';
import { Router } from '@angular/router';

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
  async onLogout() {
    const success = await this.accountService.logout();
    if (success) {
      this.menuOpen.set(false);
      this.router.navigate(['']);
    } else {
      console.error('Failed to log out');
    }
  }

  /** Handle account deletion */
  async onDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }
    const success = await this.accountService.deleteAccount();
    if (success) {
      this.menuOpen.set(false);
      this.router.navigate(['']);
    } else {
      console.error('Failed to delete account');
    }
  }
}
