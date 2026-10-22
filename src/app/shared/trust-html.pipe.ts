import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Markiert eigenes, statisches HTML (aus src/app/content) als vertrauenswürdig, damit
 * ids/Anker (z. B. Inhaltsverzeichnis der Datenschutzerklärung) erhalten bleiben.
 * Niemals für Nutzereingaben verwenden.
 */
@Pipe({ name: 'trustHtml' })
export class TrustHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  transform(value: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value ?? '');
  }
}
