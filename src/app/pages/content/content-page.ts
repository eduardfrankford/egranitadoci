import { Component, OnInit, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Block, PageDef } from '../../content/types';
import * as schema from '../../core/schema';
import { SeoService } from '../../core/seo.service';
import { SITE } from '../../core/site';
import { Faq } from '../../shared/faq/faq';
import { Gallery } from '../../shared/gallery/gallery';
import { ImgDirective } from '../../shared/img.directive';
import { ScrollToDirective } from '../../shared/scroll-to.directive';
import { TrustHtmlPipe } from '../../shared/trust-html.pipe';

/**
 * Generischer Seiten-Renderer: gibt die Blöcke einer PageDef (src/app/content/pages)
 * in der hinterlegten Reihenfolge aus – Portfolio-Kategorien, Blogbeiträge, Kontakt,
 * Shootings-Übersicht und Rechtstexte.
 */
@Component({
  selector: 'app-content-page',
  imports: [RouterLink, ImgDirective, Gallery, Faq, TrustHtmlPipe, ScrollToDirective],
  templateUrl: './content-page.html',
  styleUrl: './content-page.scss',
})
export class ContentPage implements OnInit {
  readonly page = input.required<PageDef>();
  readonly site = SITE;
  private readonly seo = inject(SeoService);
  /** Index der ersten Galerie: deren erste Bilder sind "above the fold" und werden priorisiert geladen. */
  readonly firstGallery = computed(() => this.page().blocks.findIndex((b) => b.type === 'gallery'));

  ngOnInit(): void {
    this.applySeo(this.page());
  }

  isAnchor(href: string): boolean {
    return href.startsWith('#');
  }

  /** Interne Sprungmarken in Fließtexten (z. B. Inhaltsverzeichnis der Datenschutzerklärung) ohne Seitenneuladen. */
  onProseClick(event: MouseEvent): void {
    const a = (event.target as HTMLElement | null)?.closest('a');
    if (!a || !a.hash || a.origin !== location.origin || a.pathname !== location.pathname) return;
    const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(history.state, '', a.hash);
  }

  private applySeo(page: PageDef): void {
    const name = page.h1 ?? page.title;
    const path = `/${page.slug}/`;
    const faq = page.blocks.find((b): b is Extract<Block, { type: 'faq' }> => b.type === 'faq');
    const jsonLd: object[] = [];
    let type: 'website' | 'article' = 'website';

    switch (page.kind) {
      case 'service':
        jsonLd.push(
          schema.webPage(page),
          schema.service(page, name),
          schema.breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Portfolio', path: '/portfolio/' },
            { name, path },
          ]),
        );
        break;
      case 'post':
        type = 'article';
        jsonLd.push(
          schema.blogPosting(page),
          schema.breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Shootings', path: '/shootings/' },
            { name, path },
          ]),
        );
        break;
      case 'collection':
      case 'blog':
        jsonLd.push(
          schema.webPage(page, 'CollectionPage'),
          schema.breadcrumb([
            { name: 'Home', path: '/' },
            { name, path },
          ]),
        );
        break;
      case 'contact':
        jsonLd.push(
          schema.webPage(page, 'ContactPage'),
          schema.localBusiness(),
          schema.breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Kontakt', path },
          ]),
        );
        break;
      default:
        jsonLd.push(
          schema.webPage(page),
          schema.breadcrumb([
            { name: 'Home', path: '/' },
            { name, path },
          ]),
        );
    }
    if (faq?.items.length) jsonLd.push(schema.faqPage(faq.items));

    this.seo.apply({
      title: page.title,
      description: page.description,
      path,
      type,
      image: page.ogImage ? `og/${page.slug}.jpg` : undefined,
      publishedTime: page.datePublished,
      modifiedTime: page.dateModified,
      jsonLd,
    });
  }
}
