import { Component, HostListener, inject, signal } from '@angular/core';
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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }
}
