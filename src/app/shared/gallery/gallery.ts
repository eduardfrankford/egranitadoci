import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ImageRef } from '../../content/types';
import { ImgDirective } from '../img.directive';

/**
 * Bildergalerie (Grid mit festem Seitenverhältnis oder Masonry) mit eingebauter,
 * barrierearmer Lightbox (<dialog>, Tastatur: ←/→/Esc, Wischen auf Touchgeräten).
 */
@Component({
  selector: 'app-gallery',
  imports: [ImgDirective],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  readonly images = input.required<ImageRef[]>();
  readonly layout = input<'grid' | 'masonry'>('masonry');
  readonly columns = input<number>(3);
  /** z. B. '9:16' oder '4:3' (nur Grid-Layout). */
  readonly aspect = input<string | undefined>(undefined);
  readonly label = input<string>('Bildergalerie');
  /** Anzahl der ersten Bilder, die priorisiert (eager) geladen werden – für Galerien im sichtbaren Bereich. */
  readonly eager = input<number>(0);
  /** Optionale sizes-Angabe, wenn die Galerie nicht die volle Content-Breite einnimmt. */
  readonly sizesOverride = input<string | undefined>(undefined);

  readonly aspectCss = computed(() => (this.aspect() ? this.aspect()!.replace(':', ' / ') : null));
  readonly sizes = computed(
    () =>
      this.sizesOverride() ??
      (this.columns() <= 2
        ? '(min-width: 1440px) 600px, (min-width: 640px) 45vw, 95vw'
        : '(min-width: 1440px) 400px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw'),
  );
  /** Priorisiert geladene Bilder: beim Masonry-Layout (CSS columns) die Spaltenanfänge, sonst die erste Reihe. */
  readonly eagerSet = computed(() => {
    const n = this.images().length;
    const cols = this.columns();
    const count = Math.min(this.eager(), n);
    if (this.layout() === 'masonry') {
      const perCol = Math.ceil(n / cols);
      return new Set(Array.from({ length: Math.min(count, cols) }, (_, k) => k * perCol));
    }
    return new Set(Array.from({ length: count }, (_, k) => k));
  });

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  readonly current = signal<number | null>(null);
  readonly currentImage = computed(() => {
    const i = this.current();
    return i === null ? null : this.images()[i];
  });
  private pointerStartX: number | null = null;
  private swiped = false;
  private lastTrigger: HTMLElement | null = null;

  constructor() {
    // Routenwechsel bei offener Lightbox (z. B. Browser-Zurück): <dialog> feuert kein close-Event,
    // der Body bliebe gesperrt -> Sperre beim Zerstören der Komponente aufheben.
    inject(DestroyRef).onDestroy(() => {
      if (this.current() !== null) document.body.style.overflow = '';
    });
  }

  open(index: number, trigger?: EventTarget | null): void {
    this.lastTrigger = trigger instanceof HTMLElement ? trigger : null;
    this.current.set(index);
    const dlg = this.dialog().nativeElement;
    if (!dlg.open) dlg.showModal();
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    const dlg = this.dialog().nativeElement;
    if (dlg.open) dlg.close();
  }

  /** Wird vom <dialog> nach dem Schließen (auch per Esc) ausgelöst. */
  onClosed(): void {
    this.current.set(null);
    document.body.style.overflow = '';
    this.lastTrigger?.focus();
  }

  next(): void {
    const n = this.images().length;
    this.current.update((i) => (i === null ? 0 : (i + 1) % n));
  }

  prev(): void {
    const n = this.images().length;
    this.current.update((i) => (i === null ? 0 : (i - 1 + n) % n));
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    }
  }

  /** Klick auf den Hintergrund (nicht auf Bild/Buttons) schließt. */
  onBackdropClick(event: MouseEvent): void {
    if (this.swiped) {
      this.swiped = false;
      return;
    }
    if (event.target === this.dialog().nativeElement) this.close();
  }

  onPointerDown(event: PointerEvent): void {
    this.pointerStartX = event.clientX;
  }

  onPointerUp(event: PointerEvent): void {
    if (this.pointerStartX === null) return;
    const dx = event.clientX - this.pointerStartX;
    this.pointerStartX = null;
    this.swiped = Math.abs(dx) > 50;
    if (this.swiped) {
      if (dx < 0) this.next();
      else this.prev();
    }
  }
}
