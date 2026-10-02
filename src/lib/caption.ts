import type { Photo } from '../content/photos';
import type { Lang, Strings } from '../content/strings';

/** The photo's own caption in the current language, or its category name. */
export const caption = (p: Photo, lang: Lang, t: Strings) => p[lang] ?? t.cats[p.cat];
