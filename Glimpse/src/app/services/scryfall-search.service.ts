import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';
import { ScryfallList } from '../interfaces/scryfall-list.interface';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ScryfallSearchService {

  constructor(
    private http: HttpClient
  ) { }

  private allPrintsUpdated = new Subject<ScryfallCard[]>();
  private resultCardUpdated = new Subject<ScryfallCard>();

  getAllPrintsUpdateListener() {
    return this.allPrintsUpdated.asObservable();
  }

  getResultCardUpdateListener() {
    return this.resultCardUpdated.asObservable();
  }

  findCard(cardName: string | null | undefined) {
    // encode search term for "fuzzy" key
    const searchParams = cardName ?
      { params: new HttpParams().set('fuzzy', cardName) } : {};
    // then run the search
    this.http.get<ScryfallCard>('https://api.scryfall.com/cards/named', searchParams)
      .subscribe(
        (responseData) => {
          // returns a card
          console.log(responseData);
          this.resultCardUpdated.next(responseData);

          // use prints_search_uri to get List of all prints
          this.getAllPrints(responseData.prints_search_uri);
        },
        (errorData) => {
          // 404 with either zero cards matched or more than 1 matched
          console.log(errorData);

        });
  }

  getAllPrints(url: string) {
    this.http.get<ScryfallList>(url).subscribe(
      (responseData) => {
        console.log("responseData:", responseData);
        this.allPrintsUpdated.next([...responseData.data]);
      },
      (errorData) => {
        console.log("errorData:", errorData);
      });
  }
}
