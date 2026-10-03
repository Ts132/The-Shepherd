import { useLayoutEffect, useRef, useState } from 'react';
import { byId } from '../content/photos';
import { stableVh, stableVw, subscribeViewport, useReducedMotion, useSectionProgress, useTouchLayout } from '../lib/motion';
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
  // Phones get a native swipeable strip instead of a pinned, scroll-driven track.
  const touch = useTouchLayout();
  const still = reduced || touch;
  const { t, lang, dir } = usePrefs();
  const sign = dir === 'rtl' ? 1 : -1;

  useLayoutEffect(() => {
    if (still) {
      if (track.current) track.current.style.transform = '';
      return;
    }
    const el = track.current;
    let queued = 0;
    const measure = () => {
      queued = 0;
      if (!track.current) return;
      dist.current = Math.max(0, track.current.scrollWidth - stableVw());
      setHeight(dist.current + stableVh());
    };
    // Coalesce bursts (several images/fonts finishing together) into one measurement.
    const schedule = () => {
      if (!queued) queued = requestAnimationFrame(measure);
    };
    measure();
    const ro = new ResizeObserver(schedule);
    if (el) ro.observe(el);
    const off = subscribeViewport(schedule);
    // Late-loading photos can change the track's width: measure again when each one lands.
    el?.addEventListener('load', schedule, true);
    return () => {
      cancelAnimationFrame(queued);
      ro.disconnect();
      off();
      el?.removeEventListener('load', schedule, true);
    };
  }, [still, lang]);

  useSectionProgress(
    section,
    (p) => {
      if (track.current) track.current.style.transform = `translate3d(${sign * p * dist.current}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    },
    !still,
    [height],
  );

  return (
    <section
      id="sanctuary"
      ref={section}
      className={`sanct ${still ? 'sanct--still' : ''} ${touch ? 'sanct--stack' : ''}`}
      style={{ height: still ? undefined : height }}
      aria-labelledby="sanct-title"
    >
      <div className="sanct__stage">
        <div className="sanct__track" ref={track}>
          <header className="sanct__intro">
            <Echo text={t.sanctuary.echo} />
            <h2 id="sanct-title" className="display" data-rv="title">
              {t.sanctuary.title}
            </h2>
            <p className="lede">{t.sanctuary.lede}</p>
          </header>
          {ITEMS.map((it, i) => (
            <figure
              key={it.id}
              data-rv="plate"
              data-plate={['a', 'b', 'c'][i % 3]}
              data-side={i % 2 ? 'r' : 'l'}
              data-orient={photos[i].w >= photos[i].h ? 'landscape' : 'portrait'}
              className={`sanct__item sanct__item--${it.shape}`}
              // On touch the frame follows the photograph: its own proportions, with at most ~11% trimmed
              // (frame ratio = photo ratio / 1.12), so no photograph is forced into a frame that is not its own.
              style={{ ['--y' as string]: `${it.y}vh`, ['--ar' as string]: (photos[i].w / photos[i].h / 1.12).toFixed(3) }}
            >
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
