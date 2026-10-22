import { DOCUMENT } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import * as schema from './schema';
import { SITE } from './site';

declare const PREVIEW_BUILD: boolean;

export interface SeoData {
  /** Page title without site suffix. */
  title: string;
  description?: string;
  /** Route path incl. leading and trailing slash, e.g. '/hochzeit/'. */
  path: string;
  /** Absolute URL or path (relative to site root) of the Open Graph image. */
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  /** JSON-LD objects (schema.org) for this page. */
  jsonLd?: object[];
}

/**
 * Sets <title>, meta description, canonical, Open Graph / Twitter tags and JSON-LD
 * for the current route. Works during prerendering (SSR) and in the browser.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  apply(d: SeoData): void {
    const isHome = d.path === '/';
    const fullTitle = isHome ? d.title : `${d.title} | ${SITE.name}`;
    const url = SITE.url + d.path;
    const image = d.image
      ? d.image.startsWith('http')
        ? d.image
        : SITE.url + '/' + d.image.replace(/^\//, '')
      : SITE.url + '/og/default.jpg';
    const preview = typeof PREVIEW_BUILD !== 'undefined' && PREVIEW_BUILD;
    const robots =
      d.noindex || preview
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1';

    this.title.setTitle(fullTitle);
    this.setMeta('name', 'description', d.description ?? '');
    this.setMeta('name', 'robots', robots);
    this.setMeta('property', 'og:type', d.type ?? 'website');
    this.setMeta('property', 'og:site_name', SITE.name);
    this.setMeta('property', 'og:locale', 'de_AT');
    this.setMeta('property', 'og:title', fullTitle);
    this.setMeta('property', 'og:description', d.description ?? '');
    this.setMeta('property', 'og:url', url);
    this.setMeta('property', 'og:image', image);
    this.setMeta('property', 'og:image:width', '1200');
    this.setMeta('property', 'og:image:height', '630');
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', fullTitle);
    this.setMeta('name', 'twitter:description', d.description ?? '');
    this.setMeta('name', 'twitter:image', image);
    if (d.type === 'article') {
      this.setMeta('property', 'article:published_time', d.publishedTime ?? '');
      this.setMeta('property', 'article:modified_time', d.modifiedTime ?? d.publishedTime ?? '');
      this.setMeta('property', 'article:author', SITE.owner);
    } else {
      this.removeMeta('property', 'article:published_time');
      this.removeMeta('property', 'article:modified_time');
      this.removeMeta('property', 'article:author');
    }
    this.setLink('canonical', url);
    this.setJsonLd(d.jsonLd ?? []);
  }

  private setMeta(attr: 'name' | 'property', key: string, content: string): void {
    const selector = `${attr}='${key}'`;
    if (!content) {
      this.meta.removeTag(selector);
      return;
    }
    this.meta.updateTag({ [attr]: key, content }, selector);
  }

  private removeMeta(attr: 'name' | 'property', key: string): void {
    this.meta.removeTag(`${attr}='${key}'`);
  }

  private setLink(rel: string, href: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', rel);
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  /** Ein JSON-LD-Block pro Seite: gemeinsame Entitäten (WebSite, LocalBusiness, Person) + seitenspezifische Objekte als @graph. */
  private setJsonLd(objects: object[]): void {
    this.doc.head.querySelectorAll('script[data-jsonld]').forEach((s) => s.remove());
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-jsonld', '');
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [...schema.sharedEntities(), ...objects],
    });
    this.doc.head.appendChild(script);
  }
}
