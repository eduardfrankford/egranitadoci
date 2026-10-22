import { Component, OnInit, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Block, PageDef } from '../../content/types';
import * as schema from '../../core/schema';
import { SeoService } from '../../core/seo.service';
import { Gallery } from '../../shared/gallery/gallery';
import { TrustHtmlPipe } from '../../shared/trust-html.pipe';

type Of<T extends Block['type']> = Extract<Block, { type: T }>;

/** "Über mich": Text neben Bildern, darunter Kundenstimmen. */
@Component({
  selector: 'app-about',
  imports: [RouterLink, Gallery, TrustHtmlPipe],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutPage implements OnInit {
  readonly page = input.required<PageDef>();
  private readonly seo = inject(SeoService);

  readonly h1 = computed(() => this.page().h1 ?? this.page().title);
  readonly html = computed(() =>
    this.page()
      .blocks.filter((b): b is Of<'html'> => b.type === 'html')
      .map((b) => b.html)
      .join(''),
  );
  readonly cta = computed(() => this.page().blocks.find((b): b is Of<'cta'> => b.type === 'cta'));
  readonly gallery = computed(() => {
    const galleries = this.page().blocks.filter((b): b is Of<'gallery'> => b.type === 'gallery');
    return galleries.find((g) => g.layout === 'masonry') ?? galleries[0];
  });
  readonly testimonials = computed(
    () =>
      this.page().blocks.find((b): b is Of<'testimonials'> => b.type === 'testimonials')?.items ??
      [],
  );

  ngOnInit(): void {
    const page = this.page();
    this.seo.apply({
      title: page.title,
      description: page.description,
      path: `/${page.slug}/`,
      image: `og/${page.slug}.jpg`,
      jsonLd: [
        schema.webPage(page, 'AboutPage'),
        schema.person(),
        schema.breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Über mich', path: `/${page.slug}/` },
        ]),
      ],
    });
  }
}
