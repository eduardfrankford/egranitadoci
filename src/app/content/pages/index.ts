// Lazy loaders for page content (one chunk per page).
import { PageDef } from '../types';

export const PAGE_LOADERS: Record<string, () => Promise<{ page: PageDef }>> = {
  hochzeit: () => import('./hochzeit'),
  'taufe-und-erstkommunion': () => import('./taufe-und-erstkommunion'),
  newborn: () => import('./newborn'),
  schwangerschaft: () => import('./schwangerschaft'),
  familie: () => import('./familie'),
  kindergarten: () => import('./kindergarten'),
  'vintage-hochzeit-in-hall-in-tirol-eine-romantische-zeremonie-mit-wiener-charme': () =>
    import('./vintage-hochzeit-in-hall-in-tirol-eine-romantische-zeremonie-mit-wiener-charme'),
  'unsere-liebe-in-bildern-ein-neugeborenen-fotoshooting-in-hall-in-tirol': () =>
    import('./unsere-liebe-in-bildern-ein-neugeborenen-fotoshooting-in-hall-in-tirol'),
  'mein-homestudio-so-individuell-wie-die-familien': () =>
    import('./mein-homestudio-so-individuell-wie-die-familien'),
  'zauberhaftes-magnolien-fotoshooting-in-wien': () =>
    import('./zauberhaftes-magnolien-fotoshooting-in-wien'),
  'tolle-fotos-und-lieblingskekse-zum-dritten-geburtstag': () =>
    import('./tolle-fotos-und-lieblingskekse-zum-dritten-geburtstag'),
  'unvergessliche-baby-fotos-in-feldkirch': () =>
    import('./unvergessliche-baby-fotos-in-feldkirch'),
  'xmas-shooting-oder-wie-man-den-heiligabend-einer-familie-crasht': () =>
    import('./xmas-shooting-oder-wie-man-den-heiligabend-einer-familie-crasht'),
  'herbst-minishooting-botanischer-garten-innsbruck': () =>
    import('./herbst-minishooting-botanischer-garten-innsbruck'),
  'herbst-minishooting-botanischer-garten-innsbruck-2': () =>
    import('./herbst-minishooting-botanischer-garten-innsbruck-2'),
  portfolio: () => import('./portfolio'),
  shootings: () => import('./shootings'),
  kontakt: () => import('./kontakt'),
  ueber_mich: () => import('./ueber-mich'),
  impressum: () => import('./impressum'),
  datenschutz: () => import('./datenschutz'),
  'cookie-policy-eu': () => import('./cookie-policy-eu'),
};

export const PAGE_SLUGS = Object.keys(PAGE_LOADERS);
