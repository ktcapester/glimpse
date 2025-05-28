import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the token from storage
  const auth = inject(AuthService);
  const token = auth.token();

  // attach token if present
  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
    : req;

  // If the access token (JWT) is expired, use the refresh token (cookie) to get a new access token
  // and retry the request with the new token
  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && token) {
        // try one refresh + retry
        return from(auth.refreshToken()).pipe(
          switchMap(() => {
            const newToken = auth.token();
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
              withCredentials: true,
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // if the refresh fails, clear out the old token
            auth.clearToken();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
