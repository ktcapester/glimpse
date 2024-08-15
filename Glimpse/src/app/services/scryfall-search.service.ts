import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DisplayCard } from '../interfaces/display-card.interface';
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
  
  displayCard: DisplayCard = {
    name: '',
    imgsrc: '',
    normalprice: '-.-',
    fancyprice: '-.-'
  };

  allPrints!: [];
  private listUpdated = new Subject<ScryfallCard[]>();
  private cardUpdated = new Subject<DisplayCard>();


  getListUpdateListener() {
    return this.listUpdated.asObservable();
  }

  getCardUpdateListener() {
    return this.cardUpdated.asObservable();
  }

  findCard(cardName: string | null | undefined) {
    // encode search term for "fuzzy" key
    const searchParams = cardName ?
      { params: new HttpParams().set('fuzzy', cardName) } : {};
      // then run the search
    return this.http.get<ScryfallCard>('https://api.scryfall.com/cards/named', searchParams);
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
