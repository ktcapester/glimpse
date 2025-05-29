import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}
  /**
   * Wrapper around localStorage.getItem
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Wrapper around localStorage.setItem
   */
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore write errors (e.g. quota exceeded)
    }
  }

  /**
   * Wrapper around localStorage.removeItem
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore remove errors
    }
  }
}
