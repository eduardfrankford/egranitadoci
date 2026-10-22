import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

/**
 * "Nach oben"-Button: fix rechts unten, erscheint erst nach dem Scrollen
 * (vorher lag er fix oben in der Mitte über dem Logo).
 */
@Component({
  selector: 'app-scroll-top',
  template: `
    <button
      type="button"
      class="to-top"
      [class.visible]="visible()"
      [attr.tabindex]="visible() ? 0 : -1"
      [attr.aria-hidden]="!visible()"
      (click)="scrollTop()"
      aria-label="Nach oben scrollen"
      title="Nach oben"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <path
          d="M6 15l6-6 6 6"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  `,
  styles: `
    .to-top {
      position: fixed;
      right: clamp(14px, 2vw, 28px);
      bottom: clamp(14px, 2vw, 28px);
      z-index: 90;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--c-heading);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
      opacity: 0;
      transform: translateY(12px);
      pointer-events: none;
      transition:
        opacity 0.3s var(--ease),
        transform 0.3s var(--ease),
        background 0.2s;
    }
    .to-top.visible {
      opacity: 1;
      transform: none;
      pointer-events: auto;
    }
    .to-top:hover,
    .to-top:focus-visible {
      background: var(--c-black);
    }
  `,
})
export class ScrollTop {
  readonly visible = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const onScroll = () => this.visible.set(window.scrollY > 400);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    });
  }

  scrollTop(): void {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
}
