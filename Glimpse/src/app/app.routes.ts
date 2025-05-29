import { Routes } from '@angular/router';
import { SearchStartComponent } from './search-start/search-start.component';
import { FourOhFourComponent } from './four-oh-four/four-oh-four.component';
import { LoginComponent } from './login/login.component';
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
    canActivate: [userAuthGuard],
    loadComponent: () =>
      import('./card-list/card-list.component').then(
        (m) => m.CardListComponent
      ),
  },
  {
    path: 'detail/:cardID/:cardName',
    title: 'Glimpse',
    canActivate: [userAuthGuard],
    loadComponent: () =>
      import('./card-detail/card-detail.component').then(
        (m) => m.CardDetailComponent
      ),
  },
  {
    path: 'result/:cardName',
    title: 'Glimpse',
    loadComponent: () =>
      import('./search-result/search-result.component').then(
        (m) => m.SearchResultComponent
      ),
  },
  {
    path: 'suggestions/:term',
    title: 'Glimpse',
    loadComponent: () =>
      import('./suggestions/suggestions.component').then(
        (m) => m.SuggestionsComponent
      ),
  },
  {
    path: 'none/:term',
    title: 'Glimpse',
    loadComponent: () =>
      import('./no-results/no-results.component').then(
        (m) => m.NoResultsComponent
      ),
  },
  {
    path: 'login',
    title: 'Glimpse',
    component: LoginComponent,
  },
  {
    path: 'verify',
    title: 'Glimpse',
    loadComponent: () =>
      import('./verify/verify.component').then((m) => m.VerifyComponent),
  },
  {
    path: '**',
    title: 'Glimpse 404',
    component: FourOhFourComponent,
  },
];
