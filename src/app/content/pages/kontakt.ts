import { PageDef } from '../types';

export const page: PageDef = {
  slug: 'kontakt',
  kind: 'contact',
  title: 'Kontakt – Fotoshooting in Innsbruck & Tirol anfragen',
  description:
    'Fotoshooting in Innsbruck, Tirol oder darüber hinaus anfragen: Kontaktformular, Telefon +43 664 9509546 und E-Mail egranita.doci@gmail.com. Ich freue mich auf eure Nachricht.',
  h1: 'Ich freu mich, von dir zu hören.',
  blocks: [
    {
      type: 'h1',
      text: 'Ich freu mich, von dir zu hören.',
    },
    {
      type: 'html',
      html: '<p>Ich stehe für Shootings in Tirol / Österreich oder im Ausland zur Verfügung. Kontaktiere mich für weitere Details und um die Verfügbarkeit zu überprüfen.</p>',
    },
    {
      type: 'divider',
    },
    {
      type: 'contact-info',
      items: [
        'ADDRESSE: Peerhofstrasse 15/45, 6020 Innsbruck',
        'TEL: +436649509546',
        'EMAIL: egranita.doci@gmail.com',
      ],
    },
  ],
};
