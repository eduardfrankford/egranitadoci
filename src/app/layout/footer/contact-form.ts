import { Component, afterNextRender, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SITE } from '../../core/site';

type FormState = 'idle' | 'sending' | 'sent' | 'mailto' | 'error';

/**
 * Kontaktformular mit Spam-Schutz:
 *  - Honeypot-Feld (_gotcha): für Menschen unsichtbar, Bots füllen es aus → wird still verworfen
 *  - Zeitsperre: Absenden erst nach SITE.contactFormMinFillTime möglich
 *  - Pflicht-Checkbox (Datenschutz) und Browser-/Angular-Validierung
 *  - Versand an einen Formular-Dienst (SITE.contactFormEndpoint, z. B. Formspree mit eigenem Spamfilter);
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
      const res = await fetch(SITE.contactFormEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: v.name,
          email: v.email,
          phone: v.phone,
          message: v.message,
          source: v.source,
          _subject: `Anfrage über egranitadoci.com von ${v.name}`,
          _gotcha: v._gotcha,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
