/**
 * Kontaktformular-Backend für egranitadoci.com – Google Apps Script Web-App.
 *
 * Läuft im Google-Workspace-Konto von frankford-it und schickt jede Anfrage per Mail an die
 * Fotografin (Antwort-an = Absender:in). Kein Drittanbieter, keine Datenbank.
 * Deployment-Schritte: README.md im Repo, Abschnitt "Kontaktformular".
 */
const CONFIG = {
  to: 'egranita.doci@gmail.com', // Empfängerin der Anfragen
  cc: '', // optional, z. B. 'office@frankford-it.at'
  subjectPrefix: '[egranitadoci.com] Anfrage von ',
  senderName: 'Website egranitadoci.com',
  siteKey: 'egranitadoci-2026', // muss SITE.contactFormSiteKey in src/app/core/site.ts entsprechen
  maxPerHour: 20, // globale Obergrenze gegen Spam-Fluten
  sheetId: '', // optional: ID einer Google-Tabelle, in die jede Anfrage protokolliert wird
};

function doPost(e) {
  try {
    const data = parseBody_(e);
    const check = validate_(data);
    if (!check.ok) return json_({ ok: false, error: check.error });
    // Honeypot ausgefüllt → Bot. Antwortet "ok", damit der Bot nichts lernt; es wird nichts verschickt.
    if (data._gotcha) return json_({ ok: true });
    if (!rateLimitOk_()) return json_({ ok: false, error: 'rate_limit' });
    sendMail_(data);
    logToSheet_(data);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  }
}

function doGet() {
  return json_({ ok: true, service: 'egranitadoci.com Kontaktformular' });
}

function parseBody_(e) {
  const raw = e && e.postData && e.postData.contents;
  if (!raw) throw new Error('empty body');
  const data = JSON.parse(raw);
  const s = (v, max) =>
    String(v == null ? '' : v)
      .trim()
      .slice(0, max);
  return {
    key: s(data.key, 64),
    name: s(data.name, 120),
    email: s(data.email, 200),
    phone: s(data.phone, 40),
    message: s(data.message, 4000),
    source: s(data.source, 300),
    page: s(data.page, 300),
    _gotcha: s(data._gotcha, 200),
  };
}

function validate_(d) {
  if (CONFIG.siteKey && d.key !== CONFIG.siteKey) return { ok: false, error: 'forbidden' };
  if (!d.name) return { ok: false, error: 'name' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return { ok: false, error: 'email' };
  if (d.phone && !/^[0-9+()\/\s.\-]{0,40}$/.test(d.phone)) return { ok: false, error: 'phone' };
  // Typischer Spam: viele Links in der Nachricht
  const links = (d.message.match(/https?:\/\//gi) || []).length;
  if (links > 2) return { ok: false, error: 'links' };
  return { ok: true };
}

function rateLimitOk_() {
  const cache = CacheService.getScriptCache();
  const key = 'count-' + Math.floor(Date.now() / 3600000);
  const n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 3600);
  return n <= CONFIG.maxPerHour;
}

function sendMail_(d) {
  const body = [
    'Neue Anfrage über das Kontaktformular auf egranitadoci.com',
    '',
    'Name:     ' + d.name,
    'E-Mail:   ' + d.email,
    'Telefon:  ' + (d.phone || '–'),
    '',
    'Nachricht:',
    d.message || '–',
    '',
    'Wie gefunden: ' + (d.source || '–'),
    'Seite:        ' + (d.page || '–'),
    'Zeit:         ' + Utilities.formatDate(new Date(), 'Europe/Vienna', 'dd.MM.yyyy HH:mm'),
  ].join('\n');
  const mail = {
    to: CONFIG.to,
    replyTo: d.email,
    name: CONFIG.senderName,
    subject: CONFIG.subjectPrefix + d.name,
    body: body,
  };
  if (CONFIG.cc) mail.cc = CONFIG.cc;
  MailApp.sendEmail(mail);
}

function logToSheet_(d) {
  if (!CONFIG.sheetId) return;
  const sheet = SpreadsheetApp.openById(CONFIG.sheetId).getSheets()[0];
  sheet.appendRow([new Date(), d.name, d.email, d.phone, d.message, d.source, d.page]);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
