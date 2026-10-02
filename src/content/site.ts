/**
 * Contact details and navigation. All links here are live.
 */
export const phone = {
  display: '+20 12 82995534',
  tel: 'tel:+201282995534',
  whatsapp: 'https://wa.me/201282995534',
};

export type ContactKind = 'phone' | 'whatsapp' | 'facebook' | 'instagram' | 'location';

export interface ContactRow {
  kind: ContactKind;
  /** Shown as-is (e.g. a number or handle); if null, the localised label from strings is used. */
  value: string | null;
  href: string;
  external: boolean;
  /** Numbers and handles always read left-to-right, even in Arabic. */
  ltr?: boolean;
}

export const contact: ContactRow[] = [
  { kind: 'phone', value: phone.display, href: phone.tel, external: false, ltr: true },
  { kind: 'whatsapp', value: phone.display, href: phone.whatsapp, external: true, ltr: true },
  { kind: 'facebook', value: null, href: 'https://www.facebook.com/share/1EyiLYixBL/', external: true },
  {
    kind: 'instagram',
    value: '@the_shepherd_for_coptic_works',
    href: 'https://www.instagram.com/the_shepherd_for_coptic_works',
    external: true,
    ltr: true,
  },
  { kind: 'location', value: null, href: 'https://maps.google.com/maps?q=30.0085607%2C31.1536612', external: true },
];

export const nav = ['sanctuary', 'motifs', 'process', 'wall', 'pope', 'archive', 'contact'] as const;

export const categoryIds = [
  'all',
  'sanctuary',
  'nave',
  'ceiling',
  'doors',
  'furniture',
  'carving',
  'crosses',
  'icons',
  'workshop',
] as const;
