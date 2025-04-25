import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { Router } from '@angular/router';
import { filter, tap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { narrowEventToNavigationEnd } from '../type-guard.util';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchBarComponent, NgOptimizedImage],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private sandColorRoutes = ['/login']; // defines which pages want the fake-margin to be sand color
  backgroundClass = 'bg-sand';
  private destroy$ = new Subject<void>();
  initBG = input('bg-sand'); // gets starting value from app-component

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.backgroundClass = this.initBG(); // retrieve starting value

    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(narrowEventToNavigationEnd), // type guard from Router.Event to NavigationEnd
        tap((event) => {
          // change color of fake-margin depending on which component is loaded
          if (this.sandColorRoutes.includes(event.urlAfterRedirects)) {
            this.setColorToSand(true);
          } else {
            this.setColorToSand(false);
          }
        })
      )
      .subscribe();
  }

  setColorToSand(sandy: boolean) {
    this.backgroundClass = sandy ? 'bg-sand' : 'bg-white';
  }

  onLogoClick() {
    this.router.navigate(['']);
  }
}
