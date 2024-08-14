import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {

  constructor(private router: Router) { }

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
    // use EventEmitter with form value?
    alert(this.searchForm.value.search);
  }
}
