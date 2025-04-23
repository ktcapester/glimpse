import {
  HttpEvent,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { CurrentTotalService } from '../services/current-total.service';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export const currentTotalInterceptor: HttpInterceptorFn = (req, next) => {
  const ctService = inject(CurrentTotalService);

  // If the HTTP request isn't going to glimpseAPI/list/ then we ignore it
  if (!req.url.includes(`${environment.apiURL}/list/`)) {
    return next(req);
  }

  return next(req).pipe(
    tap((event: HttpEvent<unknown>) => {
      // only act on completed HttpResponse events
      if (event instanceof HttpResponse) {
        const body = event.body as { currentTotal?: number } | null;
        // and only if the body has a numeric currentTotal field
        if (typeof body?.currentTotal === 'number') {
          // then we can update the currentTotal in the service
          ctService.setTotal(body.currentTotal);
        }
      }
    })
  );
};
