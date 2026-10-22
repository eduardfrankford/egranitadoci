import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Alle Routen werden beim Build vorgerendert (SSG). Das Ergebnis sind fertige
 * HTML-Dateien pro Seite – ideal für GitHub Pages und für Suchmaschinen/KI-Crawler.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
