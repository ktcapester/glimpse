import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { SearchDataService } from '../services/search-data.service';
import { takeUntil, tap } from 'rxjs/operators';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { ErrorCode } from '../enums/error-code';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchdata: SearchDataService,
    private state: GlimpseStateService
  ) {}

  searchForm = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
  @ViewChild('inputField') inputElement!: ElementRef;
  private destroy$ = new Subject<void>();
  displayTotal = 0;

  ngOnInit(): void {
    // Populate the search input with the term found in the URL
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        tap((params) => {
          if (params.has('term')) {
            const term = params.get('term') || '';
            this.searchForm.patchValue({ search: term });
          }
        })
      )
      .subscribe();

    // Create pipeline and subscribe to when a new search term is encountered
    this.setupSearchCallback();

    // Keep the list total price up-to-date
    this.state
      .getCurrentTotalListener()
      .pipe(
        takeUntil(this.destroy$),
        tap((currentTotal) => {
          this.displayTotal = currentTotal;
        })
      )
      .subscribe();

    // Initialize the list total with the list data from the backend.
    this.searchdata.initTotal();
  }

  ngOnDestroy(): void {
    console.log('SearchBar ngOnDestroy called!', Date.now());
    this.searchdata.clearSearchResults();
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearchCallback() {
    // This will run every time the searchdata.updateSearchTerm() is triggered.
    this.searchdata.searchResults$
      .pipe(
        takeUntil(this.destroy$), // Memory management
        tap((result) => {
          // Returned multiple cards, go to suggestions
          if (result.cards.length > 1) {
            this.router.navigate(['/suggestions', result.term]);
            return;
          }
          // Returned a single card, go to the results page.
          if (result.cards.length === 1) {
            this.router.navigate(['/result', result.cards[0].name]);
            return;
          }
          // Returned no cards, meaning either an error, or just no results
          if (result.cards.length === 0) {
            if (result.code === 'ERROR') {
              this.state.setErrorMessage(`${result.code}: ${result.details}`);
              this.router.navigate(['/404']);
              return;
            } else {
              this.router.navigate(['/none', result.term]);
              return;
            }
          }
        })
      )
      .subscribe();
  }

  navigateToList() {
    this.router.navigate(['/list']);
  }

  clearInput() {
    // TODO: scryfall does it this way:
    // card result -> search bar is cleared on load
    // ambiguous/none -> search bar keeps the entered term
    // never clears on clicking into the bar
    // this.searchForm.patchValue({ search: '' });
  }

  handleSubmit() {
    if (!this.searchForm.valid) {
      // do nothing so they stay on the page
      return;
    }

    // start a spinner?
    // make input lose focus
    this.inputElement.nativeElement.blur();
    // extract search term
    let word = this.searchForm.value.search ? this.searchForm.value.search : '';
    if (word === '') {
      return;
    }
    // Use the input to search for a card.
    // This kicks off the pipeline in search-data on line 16.
    console.log(word);
    this.searchdata.updateSearchTerm(word);
  }
}
