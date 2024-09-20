import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ScryfallCard } from '../interfaces/scryfall-card.interface';
import { ScryfallList } from '../interfaces/scryfall-list.interface';
import { GlimpseStateService } from '../services/glimpse-state.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
  constructor(
    private router: Router,
    private http: HttpClient,
    private state: GlimpseStateService
  ) {}

  searchForm = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
  @ViewChild('inputField') inputElement!: ElementRef;

  navigateToList() {
    this.router.navigate(['/list']);
  }

  clearInput() {
    this.searchForm.patchValue({ search: '' });
  }

  handleSubmit() {
    if (!this.searchForm.valid) {
      // do nothing so they stay on the page
      return;
    }

    // start a spinner?
    // make input lose focus
    this.inputElement.nativeElement.blur();

    // search for the card
    // encode search term for "fuzzy" key
    const searchParams = this.searchForm.value.search
      ? { params: new HttpParams().set('fuzzy', this.searchForm.value.search) }
      : {};
    // then run the search
    this.http
      .get<ScryfallCard>('https://api.scryfall.com/cards/named', searchParams)
      .subscribe(
        (responseData) => {
          // returns a card
          console.log('Found card:', responseData);
          this.http.get<ScryfallList>(responseData.prints_search_uri).subscribe(
            (allData) => {
              console.log('Got printings:', allData);
              this.state.setSearchedCard(responseData);
              this.state.setSearchedPrints(allData);
              this.router.navigate(['/result', responseData.name]);
            },
            (listErrorData) => {
              console.log(listErrorData);
              let message = listErrorData?.error?.details;
              if (!message) {
                message = 'Unknown error when fetching list of prints.';
              }
              this.state.setErrorMessage(message);
              this.router.navigate(['/404']);
            }
          );
        },
        (errorData) => {
          // 404 with either zero cards matched or more than 1 matched
          console.log(errorData);
          console.log('Error detail:');
          console.log(errorData?.error?.details);
          this.state.setErrorMessage(errorData?.error?.details);
          this.router.navigate(['/404']);
        }
      );
  }
}
