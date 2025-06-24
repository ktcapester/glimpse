import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

// Stub out the SearchBarComponent so we don't deal with it
@Component({
  selector: 'app-search-bar',
  template: '',
  standalone: true,
})
class StubSearchBarComponent {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    })
      .overrideComponent(HeaderComponent, {
        set: {
          imports: [StubSearchBarComponent, NgOptimizedImage],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate on logo click', () => {
    component.onLogoClick();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });

  it('should apply the default background class ("bg-sand") when no input is provided', () => {
    const fakeMarginEl: HTMLElement =
      fixture.nativeElement.querySelector('.fake-margin');
    // By default, initBG() should return "bg-sand"
    expect(fakeMarginEl.className).toContain('bg-sand');
  });

  it('should update the background class when initBG input changes to "bg-white"', () => {
    fixture.componentRef.setInput('initBG', 'bg-white');
    fixture.detectChanges();

    const fakeMarginEl: HTMLElement =
      fixture.nativeElement.querySelector('.fake-margin');
    expect(fakeMarginEl.className).toContain('bg-white');
  });
});
