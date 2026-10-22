#!/usr/bin/env node
/**
 * Nachbearbeitung des Builds für GitHub Pages:
 *  - 404.html aus der vorgerenderten /404-Seite
 *  - .nojekyll (GitHub Pages soll Dateien 1:1 ausliefern)
 *  - sitemap.xml und robots.txt (Produktion) bzw. robots.txt mit Disallow (Preview)
 *  - CNAME, wenn CUSTOM_DOMAIN gesetzt ist
 */
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/egranitadoci/browser';
const SITE_URL = 'https://egranitadoci.com';
const preview = process.env.PREVIEW === '1';
const customDomain = process.env.CUSTOM_DOMAIN?.trim();

if (!existsSync(DIST)) {
  console.error(`postbuild: ${DIST} nicht gefunden – zuerst "ng build" ausführen.`);
  process.exit(1);
}

// 404
const notFound = join(DIST, '404', 'index.html');
if (existsSync(notFound)) {
  cpSync(notFound, join(DIST, '404.html'));
  console.log('postbuild: 404.html erzeugt');
}

writeFileSync(join(DIST, '.nojekyll'), '');

// Routen aus den vorgerenderten index.html-Dateien einsammeln
function walk(dir, base = '') {
  const routes = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) routes.push(...walk(full, `${base}/${entry}`));
    else if (entry === 'index.html') routes.push(base || '/');
  }
  return routes;
}
const routes = walk(DIST)
  .filter((r) => r !== '/404')
  .map((r) => (r === '/' ? '/' : `${r}/`))
  .sort();

function lastmodOf(route) {
  const file = join(DIST, route === '/' ? 'index.html' : route.slice(1), 'index.html');
  const html = readFileSync(existsSync(file) ? file : join(DIST, 'index.html'), 'utf8');
  const m = html.match(/property="article:modified_time" content="([^"]+)"/);
  return m ? m[1] : null;
}

if (preview) {
  writeFileSync(join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  console.log('postbuild: Preview-Build – robots.txt mit Disallow, keine Sitemap');
} else {
  const urls = routes
    .map((r) => {
      const lastmod = lastmodOf(r);
      return `  <url>\n    <loc>${SITE_URL}${r}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
    })
    .join('\n');
  writeFileSync(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  writeFileSync(
    join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\n# KI-Crawler ausdrücklich erlaubt (GEO)\nUser-agent: GPTBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  );
  console.log(`postbuild: sitemap.xml mit ${routes.length} URLs, robots.txt`);
  if (customDomain) {
    writeFileSync(join(DIST, 'CNAME'), customDomain + '\n');
    console.log(`postbuild: CNAME ${customDomain}`);
  }
}
