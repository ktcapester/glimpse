import { Component, input, OnDestroy, OnInit } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { NavigationEnd, Router, Event } from '@angular/router';
import { filter, tap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [SearchBarComponent],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private sandColorRoutes = ['/login']; // defines which pages want the fake-margin to be sand color
  backgroundClass = 'bg-sand';
  private destroy$ = new Subject<void>();
  initBG = input('bg-sand'); // gets starting value from app-component

  constructor(private router: Router) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.backgroundClass = this.initBG(); // retrieve starting value

    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(
          (event: Event): event is NavigationEnd =>
            event instanceof NavigationEnd
        ), // above is how to force Angular to narrow the type of event. aka a "type guard"
        tap((event: NavigationEnd) => {
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
