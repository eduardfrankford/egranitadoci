import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FOOTER_NAV, SITE } from '../../core/site';
import { ContactForm } from './contact-form';
import { SOCIAL_ICONS } from './social-icons';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterLinkActive, ContactForm],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly site = SITE;
  readonly nav = FOOTER_NAV;
  readonly year = new Date().getFullYear();
  readonly social = [
    { name: 'Instagram', href: SITE.social.instagram, icon: SOCIAL_ICONS.instagram },
    { name: 'Pinterest', href: SITE.social.pinterest, icon: SOCIAL_ICONS.pinterest },
    { name: 'Facebook', href: SITE.social.facebook, icon: SOCIAL_ICONS.facebook },
  ];
}
