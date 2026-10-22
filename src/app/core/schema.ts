/**
 * schema.org JSON-LD Bausteine (SEO + GEO: strukturierte Daten für Suchmaschinen und KI-Assistenten).
 */
import { SITE } from './site';
import { FaqItem, PageDef } from '../content/types';

const BUSINESS_ID = `${SITE.url}/#business`;
const PERSON_ID = `${SITE.url}/#person`;
const WEBSITE_ID = `${SITE.url}/#website`;

export function localBusiness(): object {
  return {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': BUSINESS_ID,
    name: SITE.name,
    alternateName: `${SITE.name} ${SITE.tagline}`,
    description:
      'Familien-, Hochzeits-, Newborn- und Schwangerschaftsfotografin in Innsbruck und Hall in Tirol. Natürliche, emotionale Storytelling-Fotografie ohne Posen – im Homestudio, bei euch zuhause oder im Freien.',
    url: SITE.url,
    logo: `${SITE.url}/logo-760.png`,
    image: `${SITE.url}/og/default.jpg`,
    telephone: SITE.phoneE164,
    email: SITE.email,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      postalCode: SITE.address.zip,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    areaServed: SITE.areaServed.map((name) => ({ '@type': 'Place', name })),
    founder: { '@id': PERSON_ID },
    foundingDate: SITE.foundingDate,
    sameAs: Object.values(SITE.social),
    knowsAbout: [
      'Hochzeitsfotografie',
      'Newborn-Fotografie',
      'Familienfotografie',
      'Babybauch-Fotografie',
      'Tauffotografie',
      'Kindergartenfotografie',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Fotoshootings',
      itemListElement: [
        'Schwangerschafts-Fotoshooting',
        'Newborn-Fotoshooting',
        'Familien-Fotoshooting',
        'Hochzeitsfotografie',
        'Taufe und Erstkommunion',
        'Kindergarten- und KITA-Fotografie',
      ].map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name, provider: { '@id': BUSINESS_ID } },
      })),
    },
  };
}

export function person(): object {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.owner,
    jobTitle: 'Fotografin',
    description:
      'Familien- und Hochzeitsfotografin aus Innsbruck, Tirol. Fotografiert seit 2010, seit 2022 mit Egranita Doci Storytelling Photography.',
    url: `${SITE.url}/ueber_mich/`,
    image: `${SITE.url}/og/ueber_mich.jpg`,
    worksFor: { '@id': BUSINESS_ID },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Innsbruck',
      addressRegion: 'Tirol',
      addressCountry: 'AT',
    },
    sameAs: Object.values(SITE.social),
  };
}

export function webSite(): object {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: `${SITE.name} – ${SITE.tagline}`,
    url: SITE.url,
    inLanguage: SITE.language,
    publisher: { '@id': BUSINESS_ID },
  };
}

/** Auf jeder Seite mitgelieferte Entitäten, auf die per @id verwiesen wird. */
export function sharedEntities(): object[] {
  return [webSite(), localBusiness(), person()];
}

export function breadcrumb(items: { name: string; path: string }[]): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE.url + it.path,
    })),
  };
}

export function faqPage(items: FaqItem[]): object {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: [...f.a, ...(f.list ?? [])].join(' ') },
    })),
  };
}

export function webPage(page: PageDef, type = 'WebPage'): object {
  return {
    '@type': type,
    '@id': `${SITE.url}/${page.slug}/#webpage`,
    url: `${SITE.url}/${page.slug}/`,
    name: page.title,
    description: page.description,
    inLanguage: SITE.language,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': BUSINESS_ID },
    ...(page.ogImage
      ? {
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: `${SITE.url}/og/${page.slug}.jpg`,
            width: 1200,
            height: 630,
          },
        }
      : {}),
  };
}

export function service(page: PageDef, serviceType: string): object {
  return {
    '@type': 'Service',
    '@id': `${SITE.url}/${page.slug}/#service`,
    name: page.h1 ?? page.title,
    serviceType,
    description: page.description,
    provider: { '@id': BUSINESS_ID },
    areaServed: SITE.areaServed.map((name) => ({ '@type': 'Place', name })),
    url: `${SITE.url}/${page.slug}/`,
  };
}

export function blogPosting(page: PageDef): object {
  return {
    '@type': 'BlogPosting',
    '@id': `${SITE.url}/${page.slug}/#article`,
    headline: page.h1 ?? page.title,
    description: page.description,
    url: `${SITE.url}/${page.slug}/`,
    mainEntityOfPage: `${SITE.url}/${page.slug}/`,
    inLanguage: SITE.language,
    datePublished: page.datePublished,
    dateModified: page.dateModified ?? page.datePublished,
    author: { '@id': PERSON_ID },
    publisher: { '@id': BUSINESS_ID },
    ...(page.ogImage ? { image: `${SITE.url}/og/${page.slug}.jpg` } : {}),
  };
}
