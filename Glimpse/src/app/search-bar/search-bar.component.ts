import { Component } from '@angular/core';
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
export class SearchBarComponent {

  constructor(private router: Router, private searchService: ScryfallSearchService) { }

  searchForm = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  navigateToList() {
    this.router.navigate(['/list']);
  }

  handleSubmit() {
    if (!this.searchForm.valid) {
      alert("Form is invalid on submit");
      return;
    }
    // handle searching
    alert(this.searchForm.value.search);

    // start spinner
    // search for the card
    this.searchService.findCard(this.searchForm.value.search)
      .subscribe(
        (responseData) => {
          // if good result, route to /result with the result as input
          this.router.navigate(['/result', responseData.name]);
        },
        (errorData) => {
          // if bad result, stop spinner & notify
          // 404 with either zero cards matched or more than 1 matched
          console.log(errorData);
        });
  }
}
