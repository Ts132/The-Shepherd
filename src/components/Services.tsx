import { useRef, type CSSProperties } from 'react';
import { byId } from '../content/photos';
import { useRevealOnce } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';
import { Shot } from './Shot';
import { Words } from './Words';

/** Existing work photographs set beside four of the stages (stage number -> photo id). */
const IMAGES: Record<number, string> = { 0: 'w223', 2: 'w788', 3: 'w085', 6: 'w686' };
const sequence = Object.values(IMAGES).map(byId);

/**
 * From idea to execution: the eight services as one numbered, editorial process.
 * Plain vertical flow with native scrolling; each stage fades in once as it arrives.
 */
export function Services() {
  const { t, num } = usePrefs();
  const root = useRef<HTMLElement>(null);
  const s = t.services;
  const index = (n: number) => (n < 10 ? num(0) : '') + num(n);

  // The shared observer reveals the heading and each stage the first time it is on screen.
  useRevealOnce(root, '.services__head, .services__row');

  return (
    <section id="services" ref={root} className="services" aria-labelledby="services-title">
      <header className="services__head">
        <Echo text={s.echo} />
        <h2 id="services-title" className="display">
          <Words text={s.title} />
        </h2>
        <p className="lede">{s.lede}</p>
        <ol className="services__path" aria-label={s.pathLabel}>
          {s.path.map((step, i) => (
            <li key={step} style={{ ['--i' as string]: i } as CSSProperties}>
              {step}
            </li>
          ))}
        </ol>
      </header>

      <ol className="services__list">
        {s.stages.map(([title, text], i) => {
          const photo = IMAGES[i] ? byId(IMAGES[i]) : null;
          const side = Object.keys(IMAGES).indexOf(String(i)) % 2 ? 'r' : 'l'; // photos alternate: left, right, left, right
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
                <figure className="services__fig" data-side={side}>
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
