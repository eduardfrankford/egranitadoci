import { Directive, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Sanftes Scrollen zu einem Element auf der aktuellen Seite (z. B. zum Kontaktformular).
 * Rendert einen echten href (Seite + #id), damit der Link auch ohne JavaScript und für Crawler gültig ist.
 */
@Directive({
  selector: 'a[appScrollTo]',
  host: {
    '[attr.href]': 'href()',
    '(click)': 'onClick($event)',
  },
})
export class ScrollToDirective {
  readonly appScrollTo = input.required<string>();
  private readonly router = inject(Router);
  readonly href = computed(
    () => `${this.router.url.split('#')[0].split('?')[0]}#${this.appScrollTo()}`,
  );

  onClick(event: MouseEvent): void {
    const target = document.getElementById(this.appScrollTo());
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    const focusable = target.querySelector<HTMLElement>('input, textarea, button, a');
    focusable?.focus({ preventScroll: true });
  }
}
