import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ScryfallSearchService } from '../services/scryfall-search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements OnInit {

  private card$ = this.searchService.getResultCardUpdateListener();

  constructor(private router: Router, private searchService: ScryfallSearchService) { }

  ngOnInit(): void {
    this.card$.subscribe(
      (nextData) => {
        this.router.navigate(['/result', nextData.name]);
      });
  }


  searchForm = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  navigateToList() {
    this.router.navigate(['/list']);
  }

  handleSubmit() {
    if (!this.searchForm.valid) {
      // do nothing so they stay on the page
      return;
    }

    // start a spinner?
    // search for the card
    this.searchService.findCard(this.searchForm.value.search);

  }
}
