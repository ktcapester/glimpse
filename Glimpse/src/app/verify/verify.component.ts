import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { BackendGlueService } from '../services/backend-glue.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css',
})
export class VerifyComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private glue: BackendGlueService
  ) {}

  private destroy$ = new Subject<void>();
  displayMessage = 'Verifying your login. . .';
  showResponse = false;
  responseResult = false;
  responseMessage = '';
  redirectMessage = '';

  ngOnInit(): void {
    // /verify?token={token}&email={email}
    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$),
      tap((params) => {
        const userToken = params.get('token') || '';
        const userEmail = params.get('email') || '';
        this.glue.getVerifyToken(userEmail, userToken).pipe(
          takeUntil(this.destroy$),
          tap((response) => {
            this.showResponse = true;
            if (response.success === true) {
              localStorage.setItem('jwtToken', response.data);
              this.displayMessage = 'Login successful!';
              this.responseMessage = 'You can now view your saved cards.';
              this.redirectMessage = 'Go to list';
              this.responseResult = true;
            } else {
              // encountered an error!
              console.log('verify onInit got:', response.data);
              this.displayMessage = 'Login failed, please try again.';
              this.responseMessage =
                'Try the link in your email again. If this problem persists, please request a new email.';
              this.redirectMessage = 'Back to sign in';
              this.responseResult = false;
            }
          })
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClick() {
    if (this.responseResult === true) {
      // link to list
      this.router.navigate(['/list']);
    } else {
      // link to sign up
      this.router.navigate(['/login']);
    }
  }
}
