import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { DisplayCard } from '../interfaces/display-card.interface';
import { ActivatedRoute } from '@angular/router';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { ScryfallList } from '../interfaces/scryfall-list.interface';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css'
})
export class SearchResultComponent implements OnInit {

  displayCard: DisplayCard = {
    name: 'Bellowing Crier',
    imgsrc: '../../assets/blb-42-bellowing-crier.jpg',
    normalprice: '0.02',
    fancyprice: '0.06'
  };
  resultCard!: ScryfallCard | null;
  printsList!: ScryfallList | null;

  constructor(private route: ActivatedRoute, private state: GlimpseStateService) {
    const cardNameInput = this.route.snapshot.params['cardName'];
    console.log(cardNameInput);
  }

  ngOnInit(): void {
    this.state.card$.subscribe(
      card => {
        this.resultCard = card;
        this.displayCard = this.convertCard(this.resultCard);
        console.log("New card searched:", card);
      }
    );
    this.state.prints$.subscribe(
      prints => {
        this.printsList = prints;
        console.log("New prints list:", prints);
      }
    );
  }

  convertCard(scard: ScryfallCard | null) {
    let result: DisplayCard = {
      name: 'Bellowing Crier',
      imgsrc: '../../assets/blb-42-bellowing-crier.jpg',
      normalprice: '0.02',
      fancyprice: '0.06',
    }
    if (scard) {
      let imgsrc = ''
      if (scard.image_uris) {
        imgsrc = scard.image_uris.large;
      }
      else {
        imgsrc = scard.card_faces[0].image_uris.large;
      }
      result = {
        name: scard.name,
        imgsrc: imgsrc,
        normalprice: '0.00',
        fancyprice: '0.00',
      }
    }
    return result;
  }

}
