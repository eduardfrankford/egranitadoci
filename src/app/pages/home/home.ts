import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HERO_SLIDES } from '../../content/pages/home-data';
import { ImageKey } from '../../data/images';
import * as schema from '../../core/schema';
import { SeoService } from '../../core/seo.service';
import { SITE } from '../../core/site';
import { HeroCarousel } from '../../shared/hero-carousel/hero-carousel';
import { ImgDirective } from '../../shared/img.directive';
import { ScrollToDirective } from '../../shared/scroll-to.directive';

interface Feature {
  title: string;
  href: string;
  image: ImageKey;
  alt: string;
  text: string;
  imageFirst: boolean;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeroCarousel, ImgDirective, ScrollToDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage implements OnInit {
  private readonly seo = inject(SeoService);
  readonly site = SITE;
  readonly slides = HERO_SLIDES;

  readonly portrait: { key: ImageKey; alt: string } = {
    key: '20221102-ss-egranitaskydominik-0049-1-1',
    alt: 'Egranita Doci mit Kamera auf einem Feldweg bei Innsbruck',
  };

  readonly features: Feature[] = [
    {
      title: 'Schwangerschaft / Newborn',
      href: '/schwangerschaft/',
      image: 'dsc07252-bearbeitet',
      alt: 'Schlafendes Neugeborenes auf weicher Decke – Newborn-Fotoshooting in Innsbruck',
      text: 'Zarte Momente für die Ewigkeit. Erlebe die Magie der ersten Tage mit deinem Baby. Ich fange die Details und die unendliche Liebe zwischen Mutter und Kind in liebevollen Bildern ein. Ob sanfter Babybauch oder süßes Neugeborenes – gemeinsam schaffen wir unvergessliche Erinnerungen.',
      imageFirst: true,
    },
    {
      title: 'Familie / Kids',
      href: '/familie/',
      image: 'egranita-doci-familienfotografin-innsbruck-tirol-familie-2048x1365',
      alt: 'Eltern spielen mit ihrem Baby und ihrer Tochter am Fenster – Familienfotos in Tirol',
      text: 'Von den ersten Tagen bis zum großen Familienfest – ich begleite euch auf eurem gemeinsamen Weg und halte die schönsten Momente fest. Fröhliche Kinderportraits oder entspannte Familienfotos, ich sorge für unvergessliche Erinnerungen.',
      imageFirst: false,
    },
    {
      title: 'Hochzeit / Paare',
      href: '/hochzeit/',
      image: 'egranita-doci-fotografie-405-2-2048x1365',
      alt: 'Brautpaar spaziert Hand in Hand über einen Bergweg – Hochzeitsfotografin in Tirol',
      text: 'Lasst uns gemeinsam die Geschichte eurer Liebe erzählen. Ob romantische Verlobungsfotos, ein leidenschaftliches Paarshooting oder die schönsten Momente eurer Hochzeit, ich fange die Magie eurer Beziehung in unvergesslichen Bildern ein.',
      imageFirst: true,
    },
    {
      title: 'Hinter den Kulissen',
      href: '/shootings/',
      image: 'egranita-doci-familienfotografin-innsbruck-tirol-kinder-1-2048x1365',
      alt: 'Mädchen pustet Seifenblasen mit ihrer Mutter – Kinderfotos in Innsbruck',
      text: 'Erfahre mehr über meine Arbeit als Fotografin und lass dich von spannenden Einblicken in meine Shootings inspirieren. In meinem Blog findest du viele persönliche Geschichten und zahlreiche Anregungen und Tipps.',
      imageFirst: false,
    },
  ];

  ngOnInit(): void {
    this.seo.apply({
      title: 'Egranita Doci – Fotografin in Innsbruck & Tirol | Storytelling Photography',
      description:
        'Familienfotografin, Hochzeitsfotografin und Newborn-Fotografin in Innsbruck und Hall in Tirol. Natürliche, emotionale Fotos ohne Posen – Schwangerschaft, Newborn, Familie, Hochzeit, Taufe und Kindergarten.',
      path: '/',
      image: 'og/default.jpg',
      jsonLd: [schema.webSite(), schema.localBusiness(), schema.person()],
    });
  }
}
