import { useRef, type CSSProperties } from 'react';
import { byId } from '../content/photos';
import { useRevealOnce, useTouchLayout } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';
import { Shot } from './Shot';
import { Words } from './Words';

/** Existing work photographs set beside four of the stages (stage number -> photo id). */
const DESKTOP_IMAGES: Record<number, string> = { 0: 'w223', 2: 'w788', 3: 'w085', 6: 'w686' };
/** Phones give the Wood Manufacturing stage a photograph of its own too (an existing one). */
const TOUCH_IMAGES: Record<number, string> = { ...DESKTOP_IMAGES, 1: 'w450' };
/** Three shots, alternated: an arch that opens, a curtain from one side, a camera push. */
const PLATES = ['a', 'b', 'c'] as const;
const sequenceFor = (m: Record<number, string>) => Object.values(m).map(byId);

/**
 * From idea to execution: the eight services as one numbered, editorial process.
 * Plain vertical flow with native scrolling; each stage fades in once as it arrives.
 */
export function Services() {
  const { t, num } = usePrefs();
  const root = useRef<HTMLElement>(null);
  const s = t.services;
  const touch = useTouchLayout();
  const IMAGES = touch ? TOUCH_IMAGES : DESKTOP_IMAGES;
  const sequence = sequenceFor(IMAGES);
  const index = (n: number) => (n < 10 ? num(0) : '') + num(n);

  // The shared observer reveals the heading and each stage the first time it is on screen.
  useRevealOnce(root, '.services__head');
  useRevealOnce(root, '.services__row', true, touch); // touch: early, so the next shot starts as the last text leaves

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
          const plate = PLATES[Object.keys(IMAGES).indexOf(String(i)) % PLATES.length];
          const side = i % 2 === 0 ? 'r' : 'l'; // service 1 from the right, 2 from the left, 3 from the right...
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
                <figure className="services__fig" data-side={side} data-plate={plate}>
                  <Shot
                    photo={photo}
                    sequence={sequence}
                    size={touch ? 'l' : 's'}
                    className={!touch || plate === 'a' ? 'shot--arch' : ''}
                  />
                </figure>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
