import { ImageKey } from '../data/images';

/** Reference to an optimized image in /public/img (see data/images.ts). */
export interface ImageRef {
  key: ImageKey;
  alt: string;
}

export type PageKind = 'service' | 'post' | 'collection' | 'blog' | 'contact' | 'about' | 'legal';

export interface FaqItem {
  q: string;
  a: string[];
}

export interface Card {
  title: string;
  href: string;
  image: ImageRef | null;
}

export interface Testimonial {
  text: string;
  name: string;
}

export type Block =
  | { type: 'h1'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'html'; html: string }
  | { type: 'image'; image: ImageRef; href?: string }
  | {
      type: 'gallery';
      layout: 'grid' | 'masonry';
      columns: number;
      aspect?: string;
      images: ImageRef[];
    }
  | { type: 'cta'; text: string; href: string }
  | { type: 'faq'; title: string | null; items: FaqItem[] }
  | { type: 'cards'; title: string | null; items: Card[] }
  | { type: 'divider' }
  | { type: 'date'; text: string; iso: string }
  | { type: 'contact-info'; items: string[] }
  | { type: 'testimonials'; items: Testimonial[] };

export interface PageDef {
  /** URL slug without slashes, identical to the old WordPress slug (keeps rankings/backlinks). */
  slug: string;
  kind: PageKind;
  /** <title> without the site-name suffix. */
  title: string;
  description?: string;
  h1?: string;
  ogImage?: ImageKey;
  datePublished?: string;
  dateModified?: string;
  blocks: Block[];
}
