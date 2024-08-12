import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MyCard } from '../interfaces/my-card.model';
import { ScryfallCard } from '../interfaces/scryfall-card.model';
import { ScryfallList } from '../interfaces/scryfall-list.model';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ScryfallSearchService {

  displayCard: MyCard = {
    name: '',
    imgsrc: '',
    normalprice: '-.-',
    fancyprice: '-.-'
  };

  allPrints!: [];
  private listUpdated = new Subject<ScryfallCard[]>();
  private cardUpdated = new Subject<MyCard>();

  constructor(
    private http: HttpClient
  ) { }

  getListUpdateListener() {
    return this.listUpdated.asObservable();
  }

  getCardUpdateListener() {
    return this.cardUpdated.asObservable();
  }

  fuzzySearch(searchString: string) {
    // encode search term for "fuzzy" key
    const searchParams = searchString ?
      { params: new HttpParams().set('fuzzy', searchString) } : {};
    // then run the search
    this.http.get<ScryfallCard>('https://api.scryfall.com/cards/named', searchParams)
      .subscribe((responseData) => {
        // returns a card
        console.log(responseData);

        this.displayCard.name = responseData.name;
        if (responseData.image_uris) {
          this.displayCard.imgsrc = responseData.image_uris.large;
        }
        else {
          this.displayCard.imgsrc = responseData.card_faces[0].image_uris.large;
        }

        this.cardUpdated.next(this.displayCard);

        // use prints_search_uri to get List of all prints
        this.getAllPrints(responseData.prints_search_uri);
      },
        (errorData) => {
          // 404 with either zero cards matched or more than 1 matched
          console.log(errorData);

        });
  }

  getAllPrints(url: string) {
    this.http.get<ScryfallList>(url).subscribe((responseData) => {
      console.log("responseData:", responseData);
      this.allPrints = responseData.data;
      // manage data here or there? for now, there
      this.listUpdated.next([...this.allPrints]);
    });
  }
}
