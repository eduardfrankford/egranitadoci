# egranitadoci.com – Website von Egranita Doci (Storytelling Photography)

Neuentwicklung der bisherigen WordPress/Elementor-Seite als statische **Angular-22-Anwendung** mit
Server-Side-Rendering/Prerendering, gehostet auf **GitHub Pages**. Keine Datenbank, kein PHP, keine
Plugins – damit keine WordPress-Angriffsfläche mehr.

| | |
|---|---|
| Framework | Angular 22 (standalone, zoneless, Signals), TypeScript 6 |
| Rendering | `@angular/ssr` – alle 25 Routen werden beim Build als fertiges HTML vorgerendert (SSG). Der Express-Server (`npm run serve:ssr`) steht für echtes SSR auf einem Node-Host bereit. |
| Hosting | GitHub Pages über GitHub Actions (`.github/workflows/deploy.yml`) |
| Bilder | 278 Fotos als WebP in 4 Breiten (480/960/1440/1920 px) in `public/img`, Manifest in `src/app/data/images.ts` |
| Fonts | Italiana + PT Sans **selbst gehostet** (`@fontsource`), keine Google-Fonts-Requests mehr (DSGVO) |
| Tests | Vitest (`npm test`, 17 Tests), Playwright-Audit (`npm run audit`, nach `npx playwright install chromium`) |

## Schnellstart

```bash
nvm use            # Node 24 (.nvmrc)
npm ci
npm start          # Dev-Server http://localhost:4200
npm run build      # Produktions-Build + Prerendering → dist/egranitadoci/browser
npm run serve:static   # gebaute Seite lokal ansehen
npm test           # Unit-Tests
```

## Projektstruktur

```
src/app/
  core/            site.ts (Stammdaten, Navigation, Formular-Endpunkt), seo.service.ts, schema.ts (JSON-LD)
  layout/          header (Logo, Navigation, Portfolio-Dropdown), footer (Kontaktformular, Social Links), scroll-top
  shared/          img.directive.ts (responsive Bilder), gallery (Masonry/Grid + Lightbox), faq, hero-carousel
  pages/           home, about (Über mich), services (Leistungen/Preisliste), content (generischer Block-Renderer), not-found
  content/         types.ts + pages/*.ts – die Inhalte aller Seiten (Texte, Galerien, FAQ, SEO-Metadaten)
  data/images.ts   Bild-Manifest (automatisch erzeugt)
public/            img/ (WebP), og/ (Social-Media-Vorschaubilder), icons/, llms.txt, robots.txt, site.webmanifest
tools/             postbuild.mjs (404, Sitemap, robots, CNAME), images.mjs (Bild-Pipeline), audit.mjs (Playwright-Check)
docs/              BUGREPORT.md (gefundene Fehler der alten Seite mit Screenshots und Lösung)
```

## Inhalte pflegen

Alle Texte liegen als TypeScript-Daten in `src/app/content/pages/<slug>.ts`. Eine Seite besteht aus
Blöcken (`h1`, `html`, `gallery`, `cta`, `faq`, `cards`, …), die der generische Renderer
(`pages/content/content-page`) in der angegebenen Reihenfolge ausgibt. Die URL-Slugs sind bewusst
identisch mit den bisherigen WordPress-URLs (z. B. `/ueber_mich/`, `/hochzeit/`), damit Google-Rankings
und bestehende Links erhalten bleiben.

- **Preisliste**: `src/app/pages/services/price-list.ts`
- **Startseite** (Karussell, Teaser-Texte): `src/app/pages/home/home.ts` und `content/pages/home-data.ts`
- **Kontaktdaten, Social-Links, Formular-Endpunkt**: `src/app/core/site.ts`
- **SEO-Titel/-Beschreibung**: Felder `title`/`description` in der jeweiligen Seiten-Datei

### Neue Fotos hinzufügen

```bash
npm run images -- /pfad/zu/den/originalen   # erzeugt public/img/<key>-<breite>.webp und aktualisiert images.ts
```

Der Bild-Key entspricht dem Dateinamen (kleingeschrieben, Sonderzeichen → `-`). Danach den Key in der
Galerie der Seite mit einem beschreibenden `alt`-Text eintragen. Vorhandene Varianten werden übersprungen.
Social-Media-Vorschaubilder (`public/og/<slug>.jpg`, 1200 × 630) werden nicht automatisch erzeugt – für
neue Seiten einmalig mit `sharp` zuschneiden (Beispiel in `tools/images.mjs`-Stil) oder ein bestehendes verwenden.

## Kontaktformular (Spam-Schutz, Versand über Google Workspace)

Das Formular (`src/app/layout/footer/contact-form.ts`) schützt clientseitig mit **Honeypot-Feld**,
**Zeitsperre** (Absenden erst nach 3 s), Pflicht-Checkbox und Validierung. Da GitHub Pages selbst keine
Mails versenden kann, nimmt eine kleine **Google-Apps-Script-Web-App** im Google-Workspace-Konto von
frankford-it die Anfragen entgegen und schickt sie per Mail weiter (`tools/apps-script/Code.gs`). Sie prüft
serverseitig noch einmal Honeypot, Pflichtfelder, Link-Spam und eine Obergrenze pro Stunde; Antwort-an ist
die Adresse der anfragenden Person.

Einrichtung (einmalig, ca. 5 Minuten, mit dem frankford-it-Google-Konto):

1. <https://script.google.com> öffnen → **Neues Projekt** → Inhalt von `tools/apps-script/Code.gs` einfügen,
   Projekt z. B. „egranitadoci Kontaktformular“ nennen.
2. In `CONFIG` Empfängerin prüfen (`egranita.doci@gmail.com`), optional `cc` (Kopie an frankford-it) und
   `sheetId` (Google-Tabelle als Protokoll) setzen.
3. **Bereitstellen → Neue Bereitstellung** → Typ **Web-App** → „Ausführen als: Ich“ →
   „Zugriff: Jeder“ → Bereitstellen → Berechtigungen bestätigen → **Web-App-URL** (`…/exec`) kopieren.
4. URL in `src/app/core/site.ts` bei `contactFormEndpoint` eintragen, committen → der Deploy läuft automatisch.
5. Testen: Formular absenden; die Mail kommt vom ausführenden Workspace-Konto mit Antwort-an = Absender:in.

Hinweise: Nach Änderungen am Script immer eine neue Version bereitstellen. Absenderadresse ist das
ausführende Konto (für einen eigenen Absender einen Alias einrichten und `GmailApp.sendEmail(..., { from })`
verwenden). Quota: 1.500 Mails/Tag (Workspace). Der `siteKey` in `CONFIG` und `SITE.contactFormSiteKey`
müssen übereinstimmen. Ohne eingetragenen Endpunkt öffnet der Button eine vorbereitete E-Mail im Mailprogramm
des Besuchers (mailto-Fallback), die Seite ist also nie „kaputt“.

## Deployment & Domain

Jeder Push auf `main` baut und veröffentlicht die Seite automatisch (GitHub Actions → GitHub Pages).

**Preview** (Standard): `https://<github-user>.github.io/egranitadoci/` – Build mit `baseHref /egranitadoci/`,
`noindex` und `robots.txt: Disallow` (die Vorschau soll nicht in Suchmaschinen landen).

**Umstellung auf egranitadoci.com**:

1. Im Repository unter *Settings → Secrets and variables → Actions → Variables* die Variable
   `CUSTOM_DOMAIN` = `egranitadoci.com` anlegen.
2. Unter *Settings → Pages → Custom domain* `egranitadoci.com` eintragen (GitHub legt die DNS-Prüfung an).
3. DNS beim Domain-Anbieter umstellen:
   - `A`-Records für `egranitadoci.com` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` für `www` → `<github-user>.github.io`
4. Workflow erneut ausführen (oder pushen). Der Build läuft dann mit `baseHref /`, erzeugt `CNAME`,
   `sitemap.xml`, `robots.txt` (Allow) und `index,follow`. "Enforce HTTPS" in den Pages-Einstellungen aktivieren.
5. Google Search Console: neue Sitemap `https://egranitadoci.com/sitemap.xml` einreichen.

## SEO & GEO (Generative Engine Optimization)

- Vorgerendertes HTML pro Seite, `<html lang="de-AT">`, genau eine H1, Meta-Description, Canonical,
  Open-Graph/Twitter-Cards mit eigenen 1200×630-Vorschaubildern (`public/og`)
- JSON-LD: `LocalBusiness`/`ProfessionalService`, `Person`, `WebSite`, `Service`, `FAQPage`,
  `BlogPosting`, `BreadcrumbList`, `OfferCatalog` (Preisliste)
- `sitemap.xml`, `robots.txt` (inkl. explizit erlaubter KI-Crawler), `public/llms.txt` als
  kompakte Zusammenfassung für KI-Assistenten
- Beschreibende Alt-Texte, `width`/`height` an allen Bildern (kein Layout-Springen), Lazy Loading,
  Preisliste und FAQ als echter Text statt Bild/Script

## Rechtliches – bitte prüfen

Impressum, Datenschutzerklärung und Cookie Policy wurden 1:1 übernommen. Die Datenschutzerklärung
beschreibt aber noch WordPress, Elementor, Google Analytics, Google Fonts und Complianz – nichts davon ist
auf der neuen Seite im Einsatz (keine Cookies, keine Tracker, keine externen Fonts). Empfehlung: Text über
den AdSimple-Generator neu erzeugen bzw. die Cookie-Policy auf "Diese Website setzt keine Cookies" kürzen.
Ein Cookie-Banner ist aktuell nicht nötig.
