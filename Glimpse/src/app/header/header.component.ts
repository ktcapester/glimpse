import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchBarComponent, NgOptimizedImage],
})
export class HeaderComponent {
  private router = inject(Router);
  initBG = input('bg-sand'); // gets starting value from app-component

  onLogoClick() {
    this.router.navigate(['']);
  }
}
