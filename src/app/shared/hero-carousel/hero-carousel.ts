import {
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ImageRef } from '../../content/types';
import { ImgDirective } from '../img.directive';

/**
 * Startseiten-Karussell: ein Bild pro Ansicht, weiche Überblendung, Autoplay
 * (pausiert bei Hover/Fokus und bei "reduzierter Bewegung"). Im Gegensatz zum
 * bisherigen Swiper läuft nichts aus dem Viewport – die Slides liegen übereinander.
 */
@Component({
  selector: 'app-hero-carousel',
  imports: [ImgDirective],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.scss',
})
export class HeroCarousel {
  readonly slides = input.required<ImageRef[]>();
  readonly interval = input<number>(5000);

  readonly index = signal(0);
  readonly paused = signal(false);
  /** Nur bereits gezeigte (und das nächste) Bild werden gerendert – spart Bandbreite. */
  readonly loaded = signal<Set<number>>(new Set([0, 1]));
  readonly count = computed(() => this.slides().length);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const timer = window.setInterval(() => {
        if (!this.paused() && !document.hidden) this.next();
      }, this.interval());
      destroyRef.onDestroy(() => window.clearInterval(timer));
    });
  }

  go(i: number): void {
    const n = this.count();
    const idx = ((i % n) + n) % n;
    this.index.set(idx);
    this.loaded.update((s) => {
      const next = new Set(s);
      next.add(idx);
      next.add((idx + 1) % n);
      return next;
    });
  }

  next(): void {
    this.go(this.index() + 1);
  }

  prev(): void {
    this.go(this.index() - 1);
  }

  isLoaded(i: number): boolean {
    return this.loaded().has(i);
  }
}
