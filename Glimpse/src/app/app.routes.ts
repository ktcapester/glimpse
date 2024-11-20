import { Routes } from '@angular/router';
import { SearchStartComponent } from './search-start/search-start.component';
import { CardListComponent } from './card-list/card-list.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { FourOhFourComponent } from './four-oh-four/four-oh-four.component';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { NoResultsComponent } from './no-results/no-results.component';
import { CardDetailComponent } from './card-detail/card-detail.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Glimpse',
    component: SearchStartComponent,
  },
  {
    path: 'list',
    title: 'Glimpse',
    component: CardListComponent,
  },
  {
    path: 'detail/:cardID/:cardName',
    title: 'Glimpse',
    component: CardDetailComponent,
  },
  {
    path: 'result/:cardName',
    title: 'Glimpse',
    component: SearchResultComponent,
  },
  {
    path: 'suggestions',
    title: 'Glimpse',
    component: SuggestionsComponent,
  },
  {
    path: 'none/:term',
    title: 'Glimpse',
    component: NoResultsComponent,
  },
  {
    path: '**',
    title: 'Glimpse 404',
    component: FourOhFourComponent,
  },
];
