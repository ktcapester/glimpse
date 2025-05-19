import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CardSchema } from '../interfaces';
import { shareReplay } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

class LRUCache<K, V> {
  // Least Recently Used Cache
  // by deleting existing keys and re-inserting them on each operation,
  // the entry that was used the longest time ago gets pushed to the front
  // of the keys() iterator of the Map. Then when at the maxSize, the cache
  // will remove the front entry of the Map to make room for the newest value.
  constructor(private maxSize: number, private cache = new Map<K, V>()) {}

  get(key: K): V | undefined {
    const val = this.cache.get(key);
    if (!val) return undefined;
    // move to "most recent"
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  set(key: K, val: V) {
    if (this.cache.has(key)) {
      // move to "most recent"
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // reached cache limit, remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey!);
    }
    this.cache.set(key, val);
  }
}

@Injectable({
  providedIn: 'root',
})
export class SearchResultService {
  private lru = new LRUCache<string, Observable<CardSchema>>(100); // cache 100 entries
  private http = inject(HttpClient);

  getCard(cardName: string): Observable<CardSchema> {
    // given the name of a known card, calculates the prices and adds to my DB
    // returns the Card from the DB
    // now with local caching to minimize http requests
    let obs = this.lru.get(cardName);
    if (!obs) {
      obs = this.http
        .get<CardSchema>(`${environment.apiURL}/price`, {
          params: new HttpParams().set('name', cardName),
        })
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));
      this.lru.set(cardName, obs);
    }
    return obs;
  }

  addCard(card: CardSchema, listID: string) {
    // adds the card to the user's active list
    // returns the updated total for the list
    try {
      return this.http.post<{ currentTotal: number }>(
        `${environment.apiURL}/list/${listID}`,
        {
          cardId: card._id,
        }
      );
    } catch (error) {
      console.log('Error in addCard http call:', error);
      return throwError(() => error);
    }
  }
}
