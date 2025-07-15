import {
  Component,
  Input,
  ViewEncapsulation,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Renderer2,
  OnInit,
} from '@angular/core';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

@Component({
  selector: 'app-adsense-ad',
  imports: [],
  templateUrl: './adsense-ad.component.html',
  styleUrl: './adsense-ad.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AdsenseAdComponent implements OnInit, AfterViewInit {
  /** Your ca-pub-ID. You can override this per slot if you want. */
  @Input() adClient = 'ca-pub-2486565675043022';
  /** The AdSense slot ID for this unit (required) */
  @Input() adSlot = '5474608327';
  /** e.g. "auto" or a fixed size like "300x250" */
  @Input() adFormat = 'auto';
  /** e.g. { display: 'block', width: '100%', height: '90px' } */
  @Input() style: { [k: string]: string } = { display: 'block' };

  @Input() adWidthResponsive = 'true';

  @ViewChild('adContainer', { static: false })
  adContainer?: ElementRef<HTMLElement>;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.injectScriptOnce();
  }

  ngAfterViewInit() {
    this.pushAdsense();
  }

  private injectScriptOnce() {
    // only load Google's script tag a single time
    if (!(window as any).adsbygoogle) {
      const script = this.renderer.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.adClient}`;
      script.crossOrigin = 'anonymous';
      this.renderer.appendChild(document.head, script);
    }
  }

  private pushAdsense() {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      // fail silently or log
      console.error('AdSense push failed', e);
    }
  }
}
