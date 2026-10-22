import { ResolveFn, Routes } from '@angular/router';
import { PAGE_LOADERS, PAGE_SLUGS } from './content/pages';
import { PageDef } from './content/types';

/** Lädt die Inhalte einer Seite als eigenen Chunk (nur die besuchte Seite wird geladen). */
const pageResolver =
  (slug: string): ResolveFn<PageDef> =>
  () =>
    PAGE_LOADERS[slug]().then((m) => m.page);

/** Seiten mit eigenem Layout; alle anderen Slugs nutzen den generischen Block-Renderer. */
const CUSTOM_SLUGS = new Set(['ueber_mich']);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'ueber_mich',
    loadComponent: () => import('./pages/about/about').then((m) => m.AboutPage),
    resolve: { page: pageResolver('ueber_mich') },
  },
  {
    path: 'leistungen',
    loadComponent: () => import('./pages/services/services').then((m) => m.ServicesPage),
  },
  ...PAGE_SLUGS.filter((slug) => !CUSTOM_SLUGS.has(slug)).map((slug) => ({
    path: slug,
    loadComponent: () => import('./pages/content/content-page').then((m) => m.ContentPage),
    resolve: { page: pageResolver(slug) },
  })),
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage),
  },
];
