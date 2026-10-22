#!/usr/bin/env node
/**
 * Qualitätsprüfung der gebauten Seite mit Playwright (Chromium):
 *  - Screenshots aller Routen in drei Viewports (docs/screenshots/after)
 *  - horizontaler Overflow, fehlende Alt-Texte, H1-Anzahl, Title/Description, Konsolenfehler, 404-Requests
 *
 *   npm run build && npm run serve:static   (in einem Terminal)
 *   npm run audit -- http://localhost:4200  (in einem zweiten Terminal)
 *
 * Playwright muss installiert sein: npx playwright install chromium
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const base = (process.argv[2] || 'http://localhost:4200').replace(/\/$/, '');
const outDir = process.argv[3] || 'docs/screenshots/after';
const { chromium } = await import('playwright');

const routes = [
  '/',
  '/ueber_mich/',
  '/portfolio/',
  '/hochzeit/',
  '/taufe-und-erstkommunion/',
  '/newborn/',
  '/schwangerschaft/',
  '/familie/',
  '/kindergarten/',
  '/leistungen/',
  '/kontakt/',
  '/shootings/',
  '/vintage-hochzeit-in-hall-in-tirol-eine-romantische-zeremonie-mit-wiener-charme/',
  '/unsere-liebe-in-bildern-ein-neugeborenen-fotoshooting-in-hall-in-tirol/',
  '/mein-homestudio-so-individuell-wie-die-familien/',
  '/zauberhaftes-magnolien-fotoshooting-in-wien/',
  '/tolle-fotos-und-lieblingskekse-zum-dritten-geburtstag/',
  '/unvergessliche-baby-fotos-in-feldkirch/',
  '/xmas-shooting-oder-wie-man-den-heiligabend-einer-familie-crasht/',
  '/herbst-minishooting-botanischer-garten-innsbruck/',
  '/herbst-minishooting-botanischer-garten-innsbruck-2/',
  '/impressum/',
  '/datenschutz/',
  '/cookie-policy-eu/',
  '/404/',
];
const only = process.argv[4] ? process.argv[4].split(',') : null;
const selectedRoutes = only ? routes.filter((r) => only.includes(r)) : routes;
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const report = {};
let problems = 0;
for (const [vpName, vp] of Object.entries(viewports)) {
  const ctx = await browser.newContext({
    viewport: vp,
    deviceScaleFactor: 1,
    isMobile: vpName === 'mobile',
    hasTouch: vpName !== 'desktop',
  });
  for (const route of selectedRoutes) {
    const name = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '');
    const page = await ctx.newPage();
    const consoleErrors = [];
    const failed = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 200)));
    page.on(
      'response',
      (r) =>
        r.status() >= 400 &&
        !r.url().endsWith('/404/') &&
        failed.push(`${r.url().slice(0, 160)} :: ${r.status()}`),
    );
    page.on('requestfailed', (r) =>
      failed.push(`${r.url().slice(0, 160)} :: ${r.failure()?.errorText}`),
    );
    await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 800) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    // Lazy-Bilder fertig laden lassen, bevor der Screenshot entsteht
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.evaluate(() =>
      Promise.race([
        Promise.all(
          [...document.images]
            .filter((i) => !i.complete)
            .map(
              (i) =>
                new Promise((r) => {
                  i.onload = i.onerror = r;
                }),
            ),
        ),
        new Promise((r) => setTimeout(r, 5000)), // nie länger als 5 s auf Lazy-Bilder warten
      ]),
    );
    await page.waitForTimeout(300);
    const m = await page.evaluate((vpw) => {
      const de = document.documentElement;
      const overflowEls = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (
          r.width > 0 &&
          r.right > vpw + 1 &&
          getComputedStyle(el).position !== 'fixed' &&
          !el.closest('dialog')
        ) {
          overflowEls.push({
            tag: el.tagName.toLowerCase(),
            cls: String(el.className).slice(0, 80),
            right: Math.round(r.right),
          });
          if (overflowEls.length > 8) break;
        }
      }
      const imgs = [...document.images];
      const small = [...document.querySelectorAll('a,button')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24);
      }).length;
      return {
        scrollWidth: de.scrollWidth,
        innerWidth: window.innerWidth,
        scrollHeight: de.scrollHeight,
        overflowEls,
        h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content ?? null,
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
        lang: de.lang,
        imgCount: imgs.length,
        imgsNoAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
        imgsNoDims: imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height'))
          .length,
        smallTapTargets: small,
      };
    }, vp.width);
    await page.screenshot({ path: `${outDir}/${name}--${vpName}.png`, fullPage: true });
    const issues = [];
    if (m.scrollWidth > vp.width || m.innerWidth > vp.width)
      issues.push(`overflow ${m.scrollWidth}>${vp.width} (innerWidth ${m.innerWidth})`);
    if (m.h1.length !== 1) issues.push(`h1=${m.h1.length}`);
    if (!m.description) issues.push('no description');
    if (m.imgsNoAlt) issues.push(`imgs without alt: ${m.imgsNoAlt}`);
    if (consoleErrors.length) issues.push(`console errors: ${consoleErrors.length}`);
    if (failed.length) issues.push(`failed requests: ${failed.length}`);
    problems += issues.length;
    report[`${name}--${vpName}`] = { ...m, consoleErrors, failed, issues };
    console.log(
      `${vpName.padEnd(7)} ${name.padEnd(42).slice(0, 42)} h=${String(m.scrollHeight).padStart(5)} ${issues.length ? '!! ' + issues.join(' | ') : 'ok'}`,
    );
    await page.close();
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${outDir}/../audit-report.json`, JSON.stringify(report, null, 1));
console.log(
  problems
    ? `\n${problems} Auffälligkeiten – Details in ${outDir}/../audit-report.json`
    : '\nKeine Auffälligkeiten.',
);
process.exit(problems ? 1 : 0);
