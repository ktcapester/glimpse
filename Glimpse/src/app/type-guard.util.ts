import { NavigationEnd, Event } from '@angular/router';

/** A generic “is defined” guard for RxJS filters */
export function isDefined<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export function narrowEventToNavigationEnd(event: Event) {
  return event instanceof NavigationEnd;
}
