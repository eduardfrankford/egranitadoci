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
  readonly loaded = signal<Set<number>>(new Set([0]));
  /** Autoplay läuft (nur im Browser, nicht bei "reduzierter Bewegung"). */
  readonly autoplay = signal(false);
  /** Vom Nutzer angehalten (Pause-Button oder manuelle Navigation, WCAG 2.2.2). */
  readonly stopped = signal(false);
  readonly count = computed(() => this.slides().length);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // Zweites Bild erst nachladen, wenn das erste (LCP) durch ist.
      const preload = window.setTimeout(() => this.markLoaded(1), 1500);
      destroyRef.onDestroy(() => window.clearTimeout(preload));
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.autoplay.set(true);
      const timer = window.setInterval(() => {
        if (!this.paused() && !this.stopped() && !document.hidden) this.go(this.index() + 1);
      }, this.interval());
      destroyRef.onDestroy(() => window.clearInterval(timer));
    });
  }

  go(i: number): void {
    const n = this.count();
    const idx = ((i % n) + n) % n;
    this.index.set(idx);
    this.markLoaded(idx);
    this.markLoaded((idx + 1) % n);
  }

  /** Manuelle Navigation stoppt die automatische Rotation. */
  select(i: number): void {
    this.stopped.set(true);
    this.go(i);
  }

  next(): void {
    this.select(this.index() + 1);
  }

  prev(): void {
    this.select(this.index() - 1);
  }

  toggleAutoplay(): void {
    this.stopped.update((v) => !v);
  }

  private markLoaded(i: number): void {
    if (this.loaded().has(i)) return;
    this.loaded.update((s) => new Set(s).add(i));
  }

  isLoaded(i: number): boolean {
    return this.loaded().has(i);
  }
}
