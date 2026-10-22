import { Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SITE } from '../../core/site';

type FormState = 'idle' | 'sending' | 'sent' | 'mailto' | 'error';

/**
 * Kontaktformular mit Spam-Schutz:
 *  - Honeypot-Feld (_gotcha): für Menschen unsichtbar, Bots füllen es aus → wird still verworfen
 *  - Zeitsperre: Absenden erst nach SITE.contactFormMinFillTime möglich
 *  - Pflicht-Checkbox (Datenschutz) und Browser-/Angular-Validierung
 *  - Versand an die Google-Apps-Script-Web-App (SITE.contactFormEndpoint, läuft im Google-Workspace-Konto von
 *    frankford-it und prüft serverseitig Honeypot, Pflichtfelder, Link-Spam und eine Stundenobergrenze);
 *    ohne Endpunkt öffnet sich eine vorbereitete E-Mail (mailto:).
 */
@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly site = SITE;
  readonly state = signal<FormState>('idle');
  private openedAt = 0;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phone: ['', [Validators.pattern(/^[0-9+()/\s.\-]{0,30}$/)]],
    message: ['', [Validators.maxLength(4000)]],
    source: ['', [Validators.maxLength(300)]],
    consent: [false, [Validators.requiredTrue]],
    _gotcha: [''],
  });

  constructor() {
    afterNextRender(() => {
      this.openedAt = Date.now();
    });
  }

  invalid(field: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[field];
    return c.invalid && (c.touched || c.dirty);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Fokus auf das erste fehlerhafte Feld (WCAG 3.3.1)
      setTimeout(() =>
        this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    const v = this.form.getRawValue();
    // Bot-Erkennung: Honeypot ausgefüllt oder unrealistisch schnell abgeschickt → so tun, als wäre es gesendet.
    if (v._gotcha || (this.openedAt && Date.now() - this.openedAt < SITE.contactFormMinFillTime)) {
      this.state.set('sent');
      return;
    }
    if (!SITE.contactFormEndpoint) {
      this.openMailto(v);
      return;
    }
    this.state.set('sending');
    try {
      const payload = {
        key: SITE.contactFormSiteKey,
        name: v.name,
        email: v.email,
        phone: v.phone,
        message: v.message,
        source: v.source,
        page: window.location.pathname,
        _gotcha: v._gotcha,
      };
      // Bewusst ohne Content-Type-Header (→ text/plain): Google-Apps-Script-Web-Apps beantworten keinen
      // CORS-Preflight; als "einfache Anfrage" klappt der Versand direkt aus dem Browser.
      const res = await fetch(SITE.contactFormEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = (await res.json()) as { ok?: boolean; error?: string };
      if (!result.ok) throw new Error(result.error ?? 'unknown');
      this.state.set('sent');
      this.form.reset();
    } catch {
      this.state.set('error');
    }
  }

  private openMailto(v: ReturnType<typeof this.form.getRawValue>): void {
    const body = [
      `Name: ${v.name}`,
      `E-Mail: ${v.email}`,
      v.phone ? `Telefon: ${v.phone}` : '',
      '',
      v.message,
      '',
      v.source ? `Wie gefunden: ${v.source}` : '',
    ]
      .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
      .join('\n');
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent('Anfrage über egranitadoci.com')}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    this.state.set('mailto');
  }
}
