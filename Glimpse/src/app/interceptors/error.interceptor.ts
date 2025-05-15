import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '../services';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error interceptor:', error);
      if (error.status === 401) {
        // Unauthorized - send the user to the login page
        router.navigate(['/login']);
      } else if (error.status === 404) {
        // Not found - go to the 404 page
        errorService.setErrorMessage(error.message);
        router.navigate(['/404']);
      } else {
        // Other error - broadcast its contents
        errorService.setErrorMessage(error.message);
      }
      // Always re-throw (or return a user-friendly fallback (?))
      return throwError(() => error);
    })
  );
};
