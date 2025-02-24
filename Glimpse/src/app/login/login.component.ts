import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { MagicLinkService } from '../services/magic-link.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  searchForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  private destroy$ = new Subject<void>();
  emailSent = false;

  constructor(private magiclinkService: MagicLinkService) {}

  ngOnInit(): void {
    this.magiclinkService.postLink$
      .pipe(
        takeUntil(this.destroy$), // Memory management
        tap((response) => {
          if (response.result === true) {
            console.log('yeehaw successfully sent email');
            // replace page content with a message saying to check email & follow the link there
            // new component maybe?
            this.emailSent = true;
          } else {
            console.log('oh no, problem:', response.message);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.magiclinkService.clearEmail();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleSubmit() {
    if (!this.searchForm.valid) {
      // do nothing so they stay on the page
      return;
    }
    let the_email = this.searchForm.value.email
      ? this.searchForm.value.email
      : '';
    console.log('user entered:', the_email);
    this.magiclinkService.updateSendEmail(the_email);
  }
}
