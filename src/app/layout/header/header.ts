import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { SERVICE_NAV, SITE } from '../../core/site';

/**
 * Kopfbereich mit Logo und Hauptnavigation.
 * "Portfolio" ist bewusst kein Link mehr, sondern öffnet nur das Untermenü
 * (Kundenwunsch: Portfolio-Klick deaktivieren). Die Portfolio-Seite bleibt über
 * "Portfolio ansehen"-Links erreichbar.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly site = SITE;
  readonly services = SERVICE_NAV;
  readonly menuOpen = signal(false);
  readonly subOpen = signal(false);
  private readonly navToggle = viewChild<ElementRef<HTMLButtonElement>>('navToggle');
  private readonly subToggle = viewChild<ElementRef<HTMLButtonElement>>('subToggle');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeAll());
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
    if (!this.menuOpen()) this.subOpen.set(false);
  }

  toggleSub(): void {
    this.subOpen.update((v) => !v);
  }

  closeAll(): void {
    this.menuOpen.set(false);
    this.subOpen.set(false);
  }

  /** Esc schließt Menüs; lag der Fokus in einem schließenden Menü, wandert er auf den passenden Toggle (WCAG 2.4.3). */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.menuOpen() && !this.subOpen()) return;
    const active = document.activeElement;
    const inSub =
      !!active && !!this.host.nativeElement.querySelector('.sub-menu')?.contains(active);
    const inNav =
      !!active && !!this.host.nativeElement.querySelector('.site-nav')?.contains(active);
    const wasMenuOpen = this.menuOpen();
    this.closeAll();
    if (wasMenuOpen && inNav) this.navToggle()?.nativeElement.focus();
    else if (inSub) this.subToggle()?.nativeElement.focus();
  }
}
