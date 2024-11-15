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
import { takeUntil } from 'rxjs/operators';
import { GlimpseStateService } from '../services/glimpse-state.service';

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
  private useParam = false;
  displayTotal = 0;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params.has('term')) {
        const term = params.get('term') || '';
        this.useParam = true;
        this.searchForm.patchValue({ search: term });
      } else {
        this.useParam = false;
      }
    });
    this.searchdata.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe((card) => {
        if (card && !this.useParam) {
          this.searchForm.patchValue({ search: card.name });
        }
      });
    this.state
      .getCurrentTotalListener()
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentTotal) => {
        this.displayTotal = currentTotal;
      });
    this.searchdata.initTotal();
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
