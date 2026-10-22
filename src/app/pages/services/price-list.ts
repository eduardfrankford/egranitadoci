/**
 * Preisliste (Stand Juli 2025, übernommen aus der bisherigen Preisliste-Grafik).
 * price: Zahl in Euro oder null für "auf Anfrage".
 */
export interface PriceItem {
  label: string;
  price: number | null;
  note?: string;
}

export interface PriceCategory {
  title: string;
  note?: string;
  items: PriceItem[];
}

export const PRICE_LIST: PriceCategory[] = [
  {
    title: 'Schwangerschaft',
    items: [
      { label: '30 Min · 1 Outfit · 1 Person · 5 Fotos', price: 69 },
      { label: '60 Min · 1 Outfit · bis 3 Personen · 10 Fotos', price: 119 },
      { label: '90 Min · 2 Outfits · bis 5 Personen · 20 Fotos', price: 179 },
    ],
  },
  {
    title: 'Newborn',
    note: 'Nur im Homestudio. Heimshooting bei euch zuhause ab 20 Fotos möglich (siehe Zusatzpakete).',
    items: [
      { label: '1–2 h · 1 Outfit / 1 Set · 3 Personen · 5 Fotos', price: 99 },
      { label: '2–3 h · 1 Outfit / 1 Set · bis 5 Personen · 10 Fotos', price: 169 },
      { label: '3–4 h · 2 Outfits / 2 Sets · mobil möglich · 20 Fotos', price: 249 },
    ],
  },
  {
    title: 'Familie',
    items: [
      { label: '60 Min · bis 5 Personen · 5 Fotos', price: 69 },
      { label: '90 Min · bis 6 Personen · 10 Fotos', price: 119 },
      { label: '120 Min · Großfamilie · 20 Fotos', price: 179 },
    ],
  },
  {
    title: 'Reportage',
    items: [
      { label: 'Homereportage · 1–2 h · 50–100 Fotos', price: 199 },
      { label: 'Taufe / Erstkommunion · 1–2 h · 50–100 Fotos', price: 199 },
      { label: 'Hochzeit', price: null, note: 'auf Anfrage' },
    ],
  },
  {
    title: 'Zusatzpakete',
    items: [
      { label: '5 Zusatzfotos', price: 50 },
      { label: '10 Zusatzfotos', price: 90 },
      { label: 'Zusatzoutfit', price: 50 },
      { label: 'Zusatzset', price: 50 },
      { label: 'Heimshooting (Newborn, ab 20 Fotos)', price: 50 },
    ],
  },
];
