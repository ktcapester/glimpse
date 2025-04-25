import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import {
  withInterceptorsFromDi,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { appConfig } from './app/app.config';
import {
  authInterceptor,
  errorInterceptor,
  currentTotalInterceptor,
} from './app/interceptors';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    importProvidersFrom(CommonModule, BrowserModule, FormsModule),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        currentTotalInterceptor,
      ])
    ),
  ],
}).catch((err) => console.error(err));
