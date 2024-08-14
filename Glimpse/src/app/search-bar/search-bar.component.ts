import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {

  constructor(private router: Router) { }

  searchForm = new FormGroup(
    {
      search: new FormControl(''),
    }
  );

  navigateToList() {
    this.router.navigate(['/list']);
  }

  handleSubmit() {
    alert(this.searchForm.value.search);
  }
}
