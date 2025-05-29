import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { filter, tap } from 'rxjs/operators';
import { narrowEventToNavigationEnd } from './type-guard.util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  showHeader = false;
  headerBG = 'bg-white';
  footSize = 'footer-min';
  private noHeaderRoutes = ['/']; // only want the start page to have the header hidden
  private sandColorRoutes = ['/login', '/verify']; // defines which pages want the fake-margin to be sand color

  private regexEscapes(s: string): string {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  private pattern = `^(?:${this.sandColorRoutes
    .map(this.regexEscapes)
    .join('|')})`;
  private matchesSandRoute = new RegExp(this.pattern);

  ngOnInit(): void {
    this.router.events
      .pipe(
        // takeUntil(this.destroy$) is not needed here
        // because this is the root component and will automatically be cleaned up
        filter(narrowEventToNavigationEnd), // type guard
        tap((event) => {
          // determine if the header should be shown
          this.showHeader = !this.noHeaderRoutes.includes(
            event.urlAfterRedirects
          );
          // fix footer height depending on presence of header
          if (this.showHeader) {
            this.footSize = '';
          } else {
            this.footSize = 'footer-min';
          }
          // determine what color the fake-margin should be & pass into app-header
          if (this.matchesSandRoute.test(event.urlAfterRedirects)) {
            this.headerBG = 'bg-sand';
          } else {
            this.headerBG = 'bg-white';
          }
        })
      )
      .subscribe();
  }
}
