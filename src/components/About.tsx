import type { CSSProperties } from 'react';
import { useInView } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';
import { Words } from './Words';

const delay = (i: number): CSSProperties => ({ ['--i' as string]: i }) as CSSProperties;

/** About Us: who The Shepherd is, set as an editorial spread beside an outlined founding year. */
export function About() {
  const { t } = usePrefs();
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  const a = t.about;
  return (
    <section id="about" ref={ref} className={`about ${inView ? 'is-in' : ''}`} aria-labelledby="about-title">
      <div className="about__mark" aria-hidden="true">
        {a.year}
      </div>
      <header className="about__head">
        <Echo text={a.echo} />
        <p className="about__eyebrow">{a.title}</p>
        <h2 id="about-title" className="display display--sm">
          <Words text={a.heading} />
        </h2>
        <p className="about__sub">{a.sub}</p>
      </header>
      <div className="about__body">
        {a.body.map((para, i) => (
          <p key={i} className={i === 0 ? 'about__first' : undefined} style={delay(i)}>
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
