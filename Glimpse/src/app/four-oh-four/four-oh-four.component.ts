import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { GlimpseStateService } from '../services/glimpse-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-four-oh-four',
  standalone: true,
  imports: [],
  templateUrl: './four-oh-four.component.html',
  styleUrl: './four-oh-four.component.css',
})
export class FourOhFourComponent implements OnInit, OnDestroy {
  private stateService = inject(GlimpseStateService);
  private error$!: Subscription;
  message = 'error message';

  ngOnInit(): void {
    this.error$ = this.stateService
      .getErrorMessageListener()
      .subscribe((message) => {
        if (message) {
          this.message = message;
        } else {
          this.message = 'Default 404 message';
        }
      });
  }

  ngOnDestroy(): void {
    this.error$.unsubscribe();
  }
}
