import { IMAGES } from '../data/images';
import { PAGE_LOADERS, PAGE_SLUGS } from './pages';
import { PageDef } from './types';

/** Inhaltliche Qualitätssicherung aller Seiten-Definitionen (SEO-Grundregeln). */
describe('Seiteninhalte', () => {
  let pages: PageDef[] = [];

  beforeAll(async () => {
    pages = await Promise.all(PAGE_SLUGS.map((slug) => PAGE_LOADERS[slug]().then((m) => m.page)));
  });

  it('enthält alle bisherigen WordPress-Slugs', () => {
    for (const slug of [
      'hochzeit',
      'taufe-und-erstkommunion',
      'newborn',
      'schwangerschaft',
      'familie',
      'kindergarten',
      'portfolio',
      'shootings',
      'kontakt',
      'ueber_mich',
      'impressum',
      'datenschutz',
      'cookie-policy-eu',
    ]) {
      expect(PAGE_SLUGS, slug).toContain(slug);
    }
    expect(pages.filter((p) => p.kind === 'post').length).toBe(9);
  });

  it('hat pro Seite genau eine H1, einen Titel und eine Beschreibung in SEO-Länge', () => {
    for (const p of pages) {
      const h1s = p.blocks.filter((b) => b.type === 'h1');
      expect(h1s.length, `${p.slug}: H1`).toBe(1);
      expect(p.title.length, `${p.slug}: Titel`).toBeGreaterThan(5);
      expect(p.title.length, `${p.slug}: Titel zu lang`).toBeLessThanOrEqual(
        p.kind === 'post' ? 90 : 75,
      );
      expect(p.description?.length ?? 0, `${p.slug}: Description`).toBeGreaterThan(40);
      expect(p.description?.length ?? 0, `${p.slug}: Description zu lang`).toBeLessThanOrEqual(160);
    }
  });

  it('verwendet nur vorhandene Bilder und vergibt Alt-Texte', () => {
    for (const p of pages) {
      for (const b of p.blocks) {
        const refs =
          b.type === 'gallery'
            ? b.images
            : b.type === 'image'
              ? [b.image]
              : b.type === 'cards'
                ? b.items.flatMap((c) => (c.image ? [c.image] : []))
                : [];
        for (const r of refs) {
          expect(IMAGES[r.key], `${p.slug}: Bild ${r.key}`).toBeDefined();
          expect(r.alt.length, `${p.slug}: Alt-Text für ${r.key}`).toBeGreaterThan(8);
        }
      }
    }
  });

  it('verlinkt Karten eindeutig und nur auf vorhandene Seiten', () => {
    for (const p of pages) {
      for (const b of p.blocks) {
        if (b.type !== 'cards') continue;
        const hrefs = b.items.map((c) => c.href);
        expect(new Set(hrefs).size, `${p.slug}: doppelte Karten-Links`).toBe(hrefs.length);
        for (const href of hrefs) {
          const slug = href.replace(/^\/|\/$/g, '');
          expect(PAGE_SLUGS, `${p.slug}: Karten-Link ${href}`).toContain(slug);
        }
      }
    }
  });

  it('hat vollständige FAQ-Einträge und Datumsangaben bei Beiträgen', () => {
    for (const p of pages) {
      for (const b of p.blocks) {
        if (b.type === 'faq') {
          expect(b.items.length, `${p.slug}: FAQ leer`).toBeGreaterThan(0);
          for (const f of b.items) {
            expect(f.q.length).toBeGreaterThan(5);
            expect(f.a.join('').length).toBeGreaterThan(10);
          }
        }
      }
      if (p.kind === 'post')
        expect(p.datePublished, `${p.slug}: Datum`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
