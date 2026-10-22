import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ImgDirective } from './img.directive';

@Component({
  imports: [ImgDirective],
  template: `<img
    [appImg]="'brautpaar-hall-in-tirol'"
    alt="Test"
    sizes="50vw"
    [maxWidth]="max"
    [priority]="priority"
  />`,
})
class Host {
  max: number | undefined = undefined;
  priority = false;
}

describe('ImgDirective', () => {
  it('setzt src, srcset, Maße und Lazy-Loading', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('src')).toMatch(/^img\/brautpaar-hall-in-tirol-\d+\.webp$/);
    expect(img.getAttribute('srcset')).toContain('img/brautpaar-hall-in-tirol-480.webp 480w');
    expect(img.getAttribute('sizes')).toBe('50vw');
    expect(Number(img.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(img.getAttribute('height'))).toBeGreaterThan(0);
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('fetchpriority')).toBeNull();
  });

  it('begrenzt Varianten über maxWidth und lädt priorisierte Bilder eager', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.max = 480;
    fixture.componentInstance.priority = true;
    await fixture.whenStable();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('srcset')).toBe('img/brautpaar-hall-in-tirol-480.webp 480w');
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });
});
