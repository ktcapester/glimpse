import { Routes } from '@angular/router';
import { SearchStartComponent } from './search-start/search-start.component';
import { CardListComponent } from './card-list/card-list.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { FourOhFourComponent } from './four-oh-four/four-oh-four.component';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { NoResultsComponent } from './no-results/no-results.component';
import { CardDetailComponent } from './card-detail/card-detail.component';
import { LoginComponent } from './login/login.component';
import { VerifyComponent } from './verify/verify.component';
import { userAuthGuard } from './user-auth.guard';

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
    canActivate: [userAuthGuard],
  },
  {
    path: 'detail/:cardID/:cardName',
    title: 'Glimpse',
    component: CardDetailComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'result/:cardName',
    title: 'Glimpse',
    component: SearchResultComponent,
  },
  {
    path: 'suggestions/:term',
    title: 'Glimpse',
    component: SuggestionsComponent,
  },
  {
    path: 'none/:term',
    title: 'Glimpse',
    component: NoResultsComponent,
  },
  {
    path: 'login',
    title: 'Glimpse',
    component: LoginComponent,
  },
  {
    path: 'verify',
    title: 'Glimpse',
    component: VerifyComponent,
  },
  {
    path: '**',
    title: 'Glimpse 404',
    component: FourOhFourComponent,
  },
];
