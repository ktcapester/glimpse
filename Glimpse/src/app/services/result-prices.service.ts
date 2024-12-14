import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { BackendGlueService } from './backend-glue.service';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { CardPrices } from '../interfaces/backend.interface';

@Injectable({
  providedIn: 'root',
})
export class ResultPricesService {
  private priceTermSubject = new BehaviorSubject<string>('');

  priceResults$ = this.priceTermSubject.pipe(
    filter((term) => !!term),
    switchMap((term) => {
      return this.glue.getPrices(term).pipe(
        map((results) => {
          if (typeof results === 'string') {
            // got an error
            const retVal: CardPrices = {
              usd: NaN,
              usd_etched: NaN,
              usd_foil: NaN,
              eur: NaN,
              eur_etched: NaN,
              eur_foil: NaN,
            };
            return retVal;
          } else {
            // successful response
            // return the results from the server
            return results;
          }
        })
      );
    }),
    catchError((error) => {
      console.error('An unexpected error occurered:', error);
      const retVal: CardPrices = {
        usd: NaN,
        usd_etched: NaN,
        usd_foil: NaN,
        eur: NaN,
        eur_etched: NaN,
        eur_foil: NaN,
      };
      return of(retVal);
    })
  );

  constructor(private glue: BackendGlueService) {}

  updatePricesTerm(cardName: string) {
    this.priceTermSubject.next(cardName);
  }
}
