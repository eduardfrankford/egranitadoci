import { Component, OnInit, inject } from '@angular/core';
import * as schema from '../../core/schema';
import { SeoService } from '../../core/seo.service';
import { SITE } from '../../core/site';
import { ScrollToDirective } from '../../shared/scroll-to.directive';
import { PRICE_LIST } from './price-list';

/** Leistungen & Preise – als echter Text statt als Bild (lesbar, durchsuchbar, barrierefrei). */
@Component({
  selector: 'app-services',
  imports: [ScrollToDirective],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class ServicesPage implements OnInit {
  private readonly seo = inject(SeoService);
  readonly priceList = PRICE_LIST;
  readonly site = SITE;

  ngOnInit(): void {
    const offers = PRICE_LIST.flatMap((cat) =>
      cat.items.map((it) => ({
        '@type': 'Offer',
        name: `${cat.title}: ${it.label}`,
        ...(it.price !== null ? { price: it.price, priceCurrency: 'EUR' } : {}),
        itemOffered: {
          '@type': 'Service',
          name: `${cat.title} – ${it.label}`,
          provider: { '@id': `${SITE.url}/#business` },
        },
      })),
    );
    this.seo.apply({
      title: 'Leistungen & Preise – Fotoshooting in Innsbruck & Tirol',
      description:
        'Preisliste für Fotoshootings in Innsbruck und Tirol: Schwangerschaft ab 69 €, Newborn ab 99 €, Familie ab 69 €, Homereportage sowie Taufe und Erstkommunion 199 €, Hochzeit auf Anfrage.',
      path: '/leistungen/',
      image: 'og/leistungen.jpg',
      jsonLd: [
        schema.webPage({
          slug: 'leistungen',
          kind: 'legal',
          title: 'Leistungen & Preise',
          description: 'Preisliste',
          blocks: [],
        }),
        {
          '@type': 'OfferCatalog',
          '@id': `${SITE.url}/leistungen/#preisliste`,
          name: 'Preisliste Fotoshootings',
          itemListElement: offers,
        },
        schema.breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Leistungen', path: '/leistungen/' },
        ]),
      ],
    });
  }
}
