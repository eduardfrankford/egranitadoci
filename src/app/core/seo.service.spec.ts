import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;

  beforeEach(() => {
    seo = TestBed.inject(SeoService);
  });

  it('setzt Titel, Description, Canonical und Open-Graph-Tags', () => {
    seo.apply({
      title: 'Hochzeit',
      description: 'Beschreibung',
      path: '/hochzeit/',
      image: 'og/hochzeit.jpg',
    });
    expect(document.title).toBe('Hochzeit | Egranita Doci');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Beschreibung',
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://egranitadoci.com/hochzeit/',
    );
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      'https://egranitadoci.com/hochzeit/',
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://egranitadoci.com/og/hochzeit.jpg',
    );
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain(
      'index, follow',
    );
  });

  it('verwendet auf der Startseite keinen Titel-Suffix', () => {
    seo.apply({ title: 'Egranita Doci – Fotografin', path: '/' });
    expect(document.title).toBe('Egranita Doci – Fotografin');
  });

  it('liefert einen @graph mit gemeinsamen Entitäten und ersetzt ihn bei jedem Aufruf', () => {
    seo.apply({
      title: 'A',
      path: '/a/',
      jsonLd: [{ '@type': 'WebPage' }, { '@type': 'BreadcrumbList' }],
    });
    seo.apply({ title: 'B', path: '/b/', jsonLd: [{ '@type': 'WebPage' }] });
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);
    const graph = JSON.parse(scripts[0].textContent ?? '{}');
    expect(graph['@context']).toBe('https://schema.org');
    const types = graph['@graph'].map((n: { '@type': string | string[] }) => n['@type']);
    expect(types).toContainEqual('WebSite');
    expect(types).toContainEqual('Person');
    expect(types).toContainEqual('WebPage');
    expect(types).not.toContainEqual('BreadcrumbList');
  });

  it('setzt noindex, wenn gewünscht', () => {
    seo.apply({ title: '404', path: '/404/', noindex: true });
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
  });
});
