import { DefaultUrlSerializer, UrlTree } from '@angular/router';

/**
 * Serialisiert Router-URLs mit abschließendem Slash (/hochzeit/ statt /hochzeit).
 * So entsprechen interne Links exakt den bisherigen WordPress-URLs und den
 * Canonical-URLs – ohne Redirect-Umweg auf GitHub Pages.
 */
export class TrailingSlashUrlSerializer extends DefaultUrlSerializer {
  override serialize(tree: UrlTree): string {
    const url = super.serialize(tree);
    const match = url.match(/^([^?#]*)(.*)$/);
    if (!match) return url;
    const [, path, rest] = match;
    if (path === '' || path === '/' || path.endsWith('/') || /\.[a-z0-9]+$/i.test(path)) return url;
    return `${path}/${rest}`;
  }
}
