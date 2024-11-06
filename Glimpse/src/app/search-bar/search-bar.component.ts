import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { SearchDataService } from '../services/search-data.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private searchdata: SearchDataService) {}

  searchForm = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
  @ViewChild('inputField') inputElement!: ElementRef;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchdata.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe((card) => {
        if (card) {
          this.searchForm.patchValue({ search: card.name });
        }
      });
  }

  ngOnDestroy(): void {
    console.log('SearchBar ngOnDestroy called!', Date.now());
    this.searchdata.clearSearchResults();
    this.destroy$.next();
    this.destroy$.complete();
  }

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
    // extract search term
    let word = this.searchForm.value.search ? this.searchForm.value.search : '';
    if (word === '') {
      console.log('how did you do this');
      return;
    }

    this.searchdata.updateSearchTerm(word);
    if (!this.router.url.includes('/result')) {
      // only need to navigate if not already on a results page
      this.router.navigate(['/result', word]);
    }
  }
}
