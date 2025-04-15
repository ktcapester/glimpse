import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
})
export class AppComponent {}

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
