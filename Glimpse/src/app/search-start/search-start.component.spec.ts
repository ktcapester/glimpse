import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SearchStartComponent } from './search-start.component';
import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

// Stub out the SearchBarComponent so we don't deal with it
@Component({
  selector: 'app-search-bar',
  template: '',
  standalone: true,
})
class StubSearchBarComponent {}

describe('SearchStartComponent', () => {
  let component: SearchStartComponent;
  let fixture: ComponentFixture<SearchStartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SearchStartComponent], // standalone component import
    })
      .overrideComponent(SearchStartComponent, {
        set: {
          imports: [StubSearchBarComponent, NgOptimizedImage],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const messageElem = compiled.querySelector('.app-title');
    expect(messageElem?.textContent).toContain('glimpse');
  });
});
