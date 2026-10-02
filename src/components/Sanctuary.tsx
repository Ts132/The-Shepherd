import { useLayoutEffect, useRef, useState } from 'react';
import { byId } from '../content/photos';
import { useReducedMotion, useSectionProgress } from '../lib/motion';
import { Shot } from './Shot';
import { Echo } from './Echo';
import { usePrefs } from '../lib/prefs';
import { caption } from '../lib/caption';

type Shape = 'arch' | 'tall' | 'wide' | 'small';
const ITEMS: { id: string; shape: Shape; y: number }[] = [
  { id: 'w029', shape: 'arch', y: 0 },
  { id: 'w583', shape: 'tall', y: 8 },
  { id: 'w013', shape: 'wide', y: -6 },
  { id: 'w111', shape: 'small', y: 14 },
  { id: 'w605', shape: 'arch', y: -2 },
  { id: 'w026', shape: 'wide', y: 10 },
  { id: 'w667', shape: 'tall', y: -8 },
  { id: 'w722', shape: 'small', y: 4 },
  { id: 'w687', shape: 'arch', y: 6 },
];
const photos = ITEMS.map((i) => byId(i.id));

export function Sanctuary() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const dist = useRef(0);
  const reduced = useReducedMotion();
  const { t, lang, dir } = usePrefs();
  const sign = dir === 'rtl' ? 1 : -1;

  useLayoutEffect(() => {
    if (reduced) return;
    const measure = () => {
      if (!track.current) return;
      dist.current = Math.max(0, track.current.scrollWidth - window.innerWidth);
      setHeight(dist.current + window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [reduced, lang]);

  useSectionProgress(
    section,
    (p) => {
      if (track.current) track.current.style.transform = `translate3d(${sign * p * dist.current}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    },
    !reduced,
  );

  return (
    <section
      id="sanctuary"
      ref={section}
      className={`sanct ${reduced ? 'sanct--still' : ''}`}
      style={{ height: reduced ? undefined : height }}
      aria-labelledby="sanct-title"
    >
      <div className="sanct__stage">
        <div className="sanct__track" ref={track}>
          <header className="sanct__intro">
            <Echo text={t.sanctuary.echo} />
            <h2 id="sanct-title" className="display">
              {t.sanctuary.title}
            </h2>
            <p className="lede">{t.sanctuary.lede}</p>
          </header>
          {ITEMS.map((it, i) => (
            <figure key={it.id} className={`sanct__item sanct__item--${it.shape}`} style={{ ['--y' as string]: `${it.y}vh` }}>
              <Shot photo={photos[i]} sequence={photos} size="l" className={it.shape === 'arch' ? 'shot--arch' : ''} />
              <figcaption>{caption(photos[i], lang, t)}</figcaption>
            </figure>
          ))}
          <div className="sanct__end" aria-hidden="true" />
        </div>
        <div className="sanct__progress" aria-hidden="true">
          <span ref={bar} />
        </div>
      </div>
    </section>
  );
}
