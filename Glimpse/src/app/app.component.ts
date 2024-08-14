import { Component } from '@angular/core';
import { SearchResultComponent } from './search-result/search-result.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [SearchResultComponent]
})
export class AppComponent {
  title = 'Glimpse';
}
