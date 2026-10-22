import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <article class="page-box not-found">
      <p class="eyebrow">Fehler 404</p>
      <h1>Seite nicht gefunden</h1>
      <div class="prose prose--center">
        <p>
          Die gesuchte Seite gibt es leider nicht (mehr). Vielleicht hilft dir einer dieser Links
          weiter:
        </p>
      </div>
      <ul class="links">
        <li>
          <a class="btn-text" routerLink="/"
            >Startseite <span class="arrow" aria-hidden="true">⟶</span></a
          >
        </li>
        <li>
          <a class="btn-text" routerLink="/portfolio/"
            >Portfolio <span class="arrow" aria-hidden="true">⟶</span></a
          >
        </li>
        <li>
          <a class="btn-text" routerLink="/kontakt/"
            >Kontakt <span class="arrow" aria-hidden="true">⟶</span></a
          >
        </li>
      </ul>
    </article>
  `,
  styles: `
    .not-found {
      text-align: center;
      min-height: 40vh;
    }
    .links {
      list-style: none;
      padding: 0;
      margin: 1.5rem 0 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0 2rem;
    }
  `,
})
export class NotFoundPage implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.apply({
      title: 'Seite nicht gefunden',
      description:
        'Diese Seite gibt es auf egranitadoci.com nicht (mehr). Zur Startseite, zum Portfolio oder zum Kontakt.',
      path: '/404/',
      noindex: true,
    });
  }
}
