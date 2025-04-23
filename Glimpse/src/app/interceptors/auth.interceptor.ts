import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the token from storage
  const auth = inject(AuthService);
  const token = auth.token();
  // if token exists, add to the request
  // if not, forward the request as-is
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // pass along the request now that it's got a token (or not)
  return next(authReq);
};
