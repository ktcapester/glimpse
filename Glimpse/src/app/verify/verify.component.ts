import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { BackendGlueService } from '../services/backend-glue.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css',
})
export class VerifyComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private glue: BackendGlueService
  ) {}

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // /verify?token={token}&email={email}
    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$),
      tap((params) => {
        const userToken = params.get('token') || '';
        const userEmail = params.get('email') || '';
        this.glue.loginMagic(userEmail, userToken).pipe(
          takeUntil(this.destroy$),
          tap((response) => {
            localStorage.setItem('jwtToken', response.token);
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
