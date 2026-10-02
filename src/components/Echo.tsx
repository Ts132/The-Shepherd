import { usePrefs } from '../lib/prefs';

/** A section title's counterpart in the other language, set small above the heading. */
export function Echo({ text }: { text: string }) {
  const { lang } = usePrefs();
  const other = lang === 'en' ? 'ar' : 'en';
  return (
    <p className={`echo echo--${other}`} aria-hidden="true">
      <bdi lang={other}>{text}</bdi>
    </p>
  );
}
