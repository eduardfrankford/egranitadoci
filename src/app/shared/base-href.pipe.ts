import { Location } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';

/**
 * Stellt wurzelrelativen Links in statischem HTML (href="/datenschutz/…") die <base href>
 * voran, damit sie auch unter einem Unterpfad (GitHub-Pages-Preview /egranitadoci/) stimmen.
 */
@Pipe({ name: 'baseHref' })
export class BaseHrefPipe implements PipeTransform {
  private readonly location = inject(Location);

  transform(html: string | null | undefined): string {
    const base = this.location.prepareExternalUrl('/');
    if (!html || base === '/') return html ?? '';
    return html.replace(/href="\/(?!\/)/g, `href="${base}`);
  }
}
