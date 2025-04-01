import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const userAuthGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('jwtToken');
  const router = inject(Router);

  if (!token) {
    return router.parseUrl('/login');
  }
  // check token expiry
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp || Date.now() / 1000 >= decoded.exp) {
      return router.parseUrl('/login');
    }
  } catch (error) {
    console.log('Token decode error', error);
    return router.parseUrl('/login');
  }
  // Token is present and valid
  return true;
};
