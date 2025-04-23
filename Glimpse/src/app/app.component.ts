import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { filter, tap } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [RouterOutlet, HeaderComponent, FooterComponent]
})
export class AppComponent implements OnInit {
  showHeader = false;
  headerBG = 'bg-white';
  private noHeaderRoutes = ['/']; // only want the start page to have the header hidden
  private sandColorRoutes = ['/login']; // defines which pages want the fake-margin to be sand color

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        // takeUntil(this.destroy$) is not needed here
        // because this is the root component and will automatically be cleaned up
        filter(
          (event: Event): event is NavigationEnd =>
            event instanceof NavigationEnd
        ), // above is how to force Angular to narrow the type of event. aka a "type guard"
        tap((event: NavigationEnd) => {
          // determine if the header should be shown
          this.showHeader = !this.noHeaderRoutes.includes(
            event.urlAfterRedirects
          );
          // determine what color the fake-margin should be & pass into app-header
          if (this.sandColorRoutes.includes(event.urlAfterRedirects)) {
            this.headerBG = 'bg-sand';
          } else {
            this.headerBG = 'bg-white';
          }
        })
      )
      .subscribe();
  }
}

/*
add divs to app.html    DONE
add app-header        DONE
create app-footer     DONE
add app-footer          DONE
remove app-header from all other components   DONE
update all CSS >_<    ***
fix start-search CSS
fix 404 css
fix login css
fix verify css


*/
