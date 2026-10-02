import { useEffect, useRef, type CSSProperties } from 'react';
import { byId } from '../content/photos';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';
import { Shot } from './Shot';

/** Existing work photographs set beside four of the stages (stage number -> photo id). */
const IMAGES: Record<number, string> = { 0: 'w223', 2: 'w788', 3: 'w085', 6: 'w686' };
const sequence = Object.values(IMAGES).map(byId);

/**
 * From idea to execution: the eight services as one numbered, editorial process.
 * Plain vertical flow with native scrolling; each stage fades in once as it arrives.
 */
export function Services() {
  const { t, num } = usePrefs();
  const list = useRef<HTMLOListElement>(null);
  const s = t.services;
  const index = (n: number) => (n < 10 ? num(0) : '') + num(n);

  // One observer reveals each stage the first time it is on screen. No scroll handlers.
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }),
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    );
    el.querySelectorAll('.services__row').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <section id="services" className="services" aria-labelledby="services-title">
      <header className="services__head">
        <Echo text={s.echo} />
        <h2 id="services-title" className="display">
          {s.title}
        </h2>
        <p className="lede">{s.lede}</p>
        <ol className="services__path" aria-label={s.pathLabel}>
          {s.path.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </header>

      <ol className="services__list" ref={list}>
        {s.stages.map(([title, text], i) => {
          const photo = IMAGES[i] ? byId(IMAGES[i]) : null;
          return (
            <li key={title} className={`services__row ${photo ? 'has-photo' : ''}`} style={{ ['--i' as string]: i % 2 } as CSSProperties}>
              <span className="services__n" aria-hidden="true">
                {index(i + 1)}
              </span>
              <div className="services__copy">
                <h3 className="services__title">
                  <bdi>{title}</bdi>
                </h3>
                <p className="services__text">{text}</p>
              </div>
              {photo && (
                <figure className="services__fig">
                  <Shot photo={photo} sequence={sequence} size="s" className="shot--arch" />
                </figure>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
