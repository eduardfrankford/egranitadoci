/**
 * Zentrale Stammdaten der Website. Alles, was an mehreren Stellen vorkommt
 * (Kontaktdaten, Social Links, Formular-Endpunkt), wird hier gepflegt.
 */
export const SITE = {
  name: 'Egranita Doci',
  tagline: 'Storytelling Photography',
  /** Kanonische Domain (ohne Slash am Ende). */
  url: 'https://egranitadoci.com',
  language: 'de-AT',
  owner: 'Egranita Doci',
  jobTitle: 'Berufsfotografin',
  email: 'egranita.doci@gmail.com',
  phoneDisplay: '+43 664 9509546',
  phoneE164: '+436649509546',
  /** Adresse laut Kontaktseite. */
  address: {
    street: 'Peerhofstrasse 15/45',
    zip: '6020',
    city: 'Innsbruck',
    region: 'Tirol',
    country: 'AT',
  },
  /** Firmensitz laut Impressum. */
  legalAddress: {
    street: 'Faistenbergerstrasse 11',
    zip: '6060',
    city: 'Hall in Tirol',
    region: 'Tirol',
    country: 'AT',
  },
  areaServed: ['Innsbruck', 'Hall in Tirol', 'Tirol', 'Österreich'],
  foundingDate: '2022',
  social: {
    instagram: 'https://www.instagram.com/egranita/',
    facebook: 'https://www.facebook.com/profile.php?id=100063702060595',
    pinterest: 'https://at.pinterest.com/egranita/',
  },
  /**
   * Endpunkt für das Kontaktformular (z. B. Formspree: 'https://formspree.io/f/abcdefgh').
   * Leer lassen = Fallback auf eine vorbereitete E-Mail (mailto:) im Mailprogramm des Besuchers.
   */
  contactFormEndpoint: '',
  /** Mindestzeit (ms) zwischen Öffnen der Seite und Absenden – Bots füllen Formulare in Millisekunden aus. */
  contactFormMinFillTime: 3000,
} as const;

export const SERVICE_NAV = [
  { label: 'Hochzeit', path: '/hochzeit/' },
  { label: 'Taufe und Erstkommunion', path: '/taufe-und-erstkommunion/' },
  { label: 'Newborn', path: '/newborn/' },
  { label: 'Schwangerschaft', path: '/schwangerschaft/' },
  { label: 'Familie', path: '/familie/' },
  { label: 'Kindergarten', path: '/kindergarten/' },
] as const;

export const MAIN_NAV = [
  { label: 'Home', path: '/' },
  { label: 'Über mich', path: '/ueber_mich/' },
  { label: 'Leistungen', path: '/leistungen/' },
  { label: 'Kontakt', path: '/kontakt/' },
  { label: 'Shootings', path: '/shootings/' },
] as const;

export const FOOTER_NAV = [
  { label: 'Home', path: '/' },
  { label: 'Über mich', path: '/ueber_mich/' },
  { label: 'Kontakt', path: '/kontakt/' },
  { label: 'Datenschutz', path: '/datenschutz/' },
  { label: 'Impressum', path: '/impressum/' },
  { label: 'Cookie Policy (EU)', path: '/cookie-policy-eu/' },
] as const;
