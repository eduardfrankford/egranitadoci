import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { IMAGES, ImageKey } from '../data/images';

/** Pfad einer WebP-Variante relativ zur <base href>. */
export function imgUrl(key: ImageKey, width: number): string {
  return `img/${key}-${width}.webp`;
}

/** Größte verfügbare Breite eines Bildes. */
export function imgMaxWidth(key: ImageKey): number {
  const sizes = IMAGES[key].sizes;
  return sizes[sizes.length - 1];
}

/**
 * Responsive Bilder aus dem Manifest (src/app/data/images.ts):
 * `<img [appImg]="'brautpaar-hall-in-tirol'" alt="…" sizes="(min-width: 1100px) 33vw, 100vw">`
 * setzt src/srcset/sizes/width/height, lazy loading und decoding automatisch.
 */
@Directive({
  selector: 'img[appImg]',
  host: {
    '[attr.src]': 'src()',
    '[attr.srcset]': 'srcset()',
    '[attr.sizes]': 'sizes()',
    '[attr.width]': 'meta().w',
    '[attr.height]': 'meta().h',
    '[attr.loading]': 'priority() ? "eager" : "lazy"',
    '[attr.fetchpriority]': 'priority() ? "high" : null',
    '[attr.decoding]': 'priority() ? "sync" : "async"',
  },
})
export class ImgDirective {
  readonly appImg = input.required<ImageKey>();
  readonly sizes = input<string>('100vw');
  /** Above-the-fold image (LCP): eager loading + high fetch priority. */
  readonly priority = input(false, { transform: booleanAttribute });
  /** Optional: Varianten oberhalb dieser Breite weglassen (z. B. kleine Thumbnails). */
  readonly maxWidth = input<number | undefined>(undefined);

  readonly meta = computed(() => IMAGES[this.appImg()]);
  readonly widths = computed(() => {
    const max = this.maxWidth();
    const all = this.meta().sizes;
    const limited = max ? all.filter((w) => w <= max) : all;
    return limited.length ? limited : [all[0]];
  });
  readonly src = computed(() => {
    const w = this.widths();
    const pick = w.find((x) => x >= 960) ?? w[w.length - 1];
    return imgUrl(this.appImg(), pick);
  });
  readonly srcset = computed(() =>
    this.widths()
      .map((w) => `${imgUrl(this.appImg(), w)} ${w}w`)
      .join(', '),
  );
}
