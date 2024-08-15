import { Routes } from "@angular/router";
import { SearchStartComponent } from "./search-start/search-start.component";
import { CardListComponent } from "./card-list/card-list.component";
import { SearchResultComponent } from "./search-result/search-result.component";
import { TempresultsComponent } from "./tempresults/tempresults.component";

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
        path: 'result/:cardName',
        title: 'Glimpse',
        component: SearchResultComponent,
    },
    {
        path: 'temp',
        title: 'Glimpse',
        component: TempresultsComponent,
    },
    {
        path: '**',
        title: 'Glimpse',
        component: SearchResultComponent,
    },
];
