import { Component, ElementRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { ScrollTop } from './layout/scroll-top/scroll-top';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ScrollTop],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Skip-Link: direkt zum Inhalt springen (ohne #-Navigation, die mit <base href> kollidieren würde). */
  skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.host.nativeElement.querySelector<HTMLElement>('#main');
    main?.focus();
    main?.scrollIntoView();
  }
}
