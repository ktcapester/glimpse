import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private glue: BackendGlueService
  ) {}

  private destroy$ = new Subject<void>();
  displayMessage = 'Verifying your login. . .';
  showSuccess = false;
  showFail = false;

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
            if (response.success === true) {
              localStorage.setItem('jwtToken', response.data);
              this.displayMessage = 'Login successful!';
              this.showSuccess = true;
            } else {
              // encountered an error!
              console.log('verify onInit got:', response.data);
              this.displayMessage = 'Login failed, please try again.';
              this.showFail = true;
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
}
