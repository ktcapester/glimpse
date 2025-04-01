import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { BackendGlueService } from './backend-glue.service';

@Injectable({
  providedIn: 'root',
})
export class MagicLinkService {
  constructor(private glue: BackendGlueService) {}

  private postLinkSubject = new BehaviorSubject<string>('');

  postLink$ = this.postLinkSubject.pipe(
    filter((term) => !!term),
    switchMap((email) => {
      return this.glue.postMagicLink(email).pipe(
        map((success) => {
          console.log('Email successfully sent!', success);
          return { result: true, message: 'Email successfully sent!' };
        }),
        catchError((error) => {
          console.error(error);
          return of({
            result: false,
            message: 'Unexpected error in postLink$',
          });
        })
      );
    })
  );

  updateSendEmail(email: string) {
    this.postLinkSubject.next(email);
  }

  clearEmail() {
    this.postLinkSubject.next('');
  }
}
