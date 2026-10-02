import { useRef, type CSSProperties } from 'react';
import { churches } from '../content/churches';
import { useInView, useRevealOnce, useTouchLayout } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';
import { Words } from './Words';

/**
 * The churches and projects, as a numbered editorial index. The names are Arabic in both
 * languages, exactly as supplied, and live only here (never on the photographs).
 */
export function Churches() {
  const { t, num } = usePrefs();
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  const list = useRef<HTMLOListElement>(null);
  const touch = useTouchLayout();
  // Touch: each row draws in as it arrives, like entries in an archive index.
  useRevealOnce(list, '.churches__row', touch);
  // two-digit index in the current numerals: 01 / ٠١
  const index = (n: number) => (n < 10 ? num(0) : '') + num(n);

  return (
    <section id="churches" ref={ref} className={`churches ${inView ? 'is-in' : ''}`} aria-labelledby="churches-title">
      <header className="churches__head">
        <Echo text={t.churches.echo} />
        <h2 id="churches-title" className="display">
          <Words text={t.churches.title} />
        </h2>
        <p className="lede">{t.churches.lede}</p>
      </header>
      <ol className="churches__list" ref={list}>
        {churches.map((name, i) => (
          <li key={name} className="churches__row" style={{ ['--i' as string]: Math.min(i, 8) } as CSSProperties}>
            <span className="churches__n" aria-hidden="true">
              {index(i + 1)}
            </span>
            <span className="churches__name" lang="ar" dir="rtl">
              {name}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
