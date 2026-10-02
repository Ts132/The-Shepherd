import type { CSSProperties } from 'react';
import { useInView } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';

/** The journey: a vertical editorial timeline. Every step restates the About Us text; nothing is added. */
export function Journey() {
  const { t } = usePrefs();
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
  return (
    <section id="journey" ref={ref} className={`journey ${inView ? 'is-in' : ''}`} aria-labelledby="journey-title">
      <header className="journey__head">
        <Echo text={t.journey.echo} />
        <h2 id="journey-title" className="display display--sm">
          {t.journey.title}
        </h2>
      </header>
      <ol className="journey__list">
        {t.journey.steps.map(([mark, title, text], i) => (
          <li key={mark} className="journey__item" style={{ ['--i' as string]: i } as CSSProperties}>
            <span className="journey__mark">{mark}</span>
            <h3 className="journey__title">{title}</h3>
            <p className="journey__text">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
