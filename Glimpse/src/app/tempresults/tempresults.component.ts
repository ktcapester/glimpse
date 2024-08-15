import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { DisplayCard } from '../interfaces/display-card.interface';

@Component({
  selector: 'app-tempresults',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './tempresults.component.html',
  styleUrl: './tempresults.component.css'
})
export class TempresultsComponent {
  displayCard: DisplayCard = {
    name: 'Bellowing Crier',
    imgsrc: '../../assets/blb-42-bellowing-crier.jpg',
    normalprice: '0.02',
    fancyprice: '0.06'
  };
}
