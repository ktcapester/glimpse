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
import { Subscription } from 'rxjs';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { BackendGlueService } from '../services/backend-glue.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private state: GlimpseStateService,
    private glue: BackendGlueService
  ) {}

  searchForm = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
  @ViewChild('inputField') inputElement!: ElementRef;
  private card$!: Subscription;

  ngOnInit(): void {
    this.card$ = this.state.getBackendCardListener().subscribe((card) => {
      if (card) {
        this.searchForm.patchValue({ search: card.name });
      }
    });
  }

  ngOnDestroy(): void {
    this.card$.unsubscribe();
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
    // use backend to search and process the result
    this.glue.getCardSearch(word).subscribe((response) => {
      if (typeof response === 'string') {
        // error response
        this.state.setErrorMessage(response);
        this.router.navigate(['/404']);
      } else {
        // successful response
        // aka response is CardSearch obj
        this.state.setBackendCard(response);
        this.router.navigate(['/result', response.name]);
      }
    });
  }
}
