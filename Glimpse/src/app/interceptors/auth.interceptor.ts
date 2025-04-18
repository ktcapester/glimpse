import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the token from storage
  const token = localStorage.getItem('jwtToken');

  // If there is no token, just forward the request as-is
  if (!token) {
    return next(req);
  }

  // Clone the incoming request and add the auth header to it
  const authRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Send the new request
  return next(authRequest);
};
