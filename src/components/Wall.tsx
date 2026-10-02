import { useEffect, useMemo, useRef } from 'react';
import { photos, type Photo } from '../content/photos';
import { useReducedMotion } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';
import { Shot } from './Shot';

/** Deterministic shuffle so the wall is the same on every visit (and on server and client). */
function shuffle<T>(arr: T[], seed: number) {
  const a = arr.slice();
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ROWS = 3;
const PER_ROW = 32;
const pool = shuffle(
  photos.filter((p) => p.cat !== 'workshop'),
  7,
);
const rows: Photo[][] = Array.from({ length: ROWS }, (_, r) => pool.slice(r * PER_ROW, (r + 1) * PER_ROW));
const everything = rows.flat();

/**
 * Three rows of photographs drifting past in alternate directions. Scrolling the
 * page speeds them up (in the scroll direction); hovering a row lets it come to rest.
 */
export function Wall() {
  const { t } = usePrefs();
  const reduced = useReducedMotion();
  return (
    <section id="wall" className={`wall ${reduced ? 'wall--still' : ''}`} aria-labelledby="wall-title">
      <header className="wall__head">
        <Echo text={t.wall.echo} />
        <h2 id="wall-title" className="display">
          {t.wall.title}
        </h2>
        <p className="lede">{t.wall.lede}</p>
      </header>
      <div className="wall__rows">
        {rows.map((r, i) => (
          <Row key={i} photos={r} index={i} reduced={reduced} />
        ))}
      </div>
    </section>
  );
}

function Row({ photos: list, index, reduced }: { photos: Photo[]; index: number; reduced: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const { dir } = usePrefs();
  const offsets = useMemo(() => list.map((_, i) => ((i * 37 + index * 11) % 7) - 3), [list, index]);

  useEffect(() => {
    const tr = track.current;
    const rw = row.current;
    if (!tr || !rw || reduced) return;
    const baseDir = (index % 2 === 0 ? -1 : 1) * (dir === 'rtl' ? -1 : 1);
    let x = -((index * 613) % 900);
    let speed = 1;
    let target = 1;
    let boost = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    let visible = false;

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(64, now - lastT);
      lastT = now;
      const half = tr.scrollWidth / 2;
      speed += (target - speed) * 0.06;
      boost *= 0.92;
      x += baseDir * (0.035 * speed + boost) * dt;
      if (half > 0) {
        if (x <= -half) x += half;
        if (x > 0) x -= half;
      }
      tr.style.transform = `translate3d(${x}px,0,0)`;
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      lastT = performance.now();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onScroll = () => {
      const y = window.scrollY;
      boost = Math.max(-1.2, Math.min(1.2, boost + (y - lastY) * 0.004));
      lastY = y;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(rw);
    window.addEventListener('scroll', onScroll, { passive: true });
    const pause = () => (target = 0);
    const resume = () => (target = 1);
    rw.addEventListener('pointerenter', pause);
    rw.addEventListener('pointerleave', resume);
    rw.addEventListener('focusin', pause);
    rw.addEventListener('focusout', resume);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      rw.removeEventListener('pointerenter', pause);
      rw.removeEventListener('pointerleave', resume);
      rw.removeEventListener('focusin', pause);
      rw.removeEventListener('focusout', resume);
    };
  }, [reduced, index, dir]);

  const items = (copy: number) =>
    list.map((p, i) => (
      <div
        key={`${copy}-${p.id}`}
        className={`wall__item ${(i + index) % 6 === 2 && p.h > p.w ? 'is-arch' : ''}`}
        style={{ aspectRatio: `${p.w} / ${p.h}`, ['--dy' as string]: `${offsets[i]}vh` }}
        aria-hidden={copy === 1 ? true : undefined}
      >
        <Shot photo={p} sequence={everything} tabIndex={copy === 1 ? -1 : undefined} className={(i + index) % 6 === 2 && p.h > p.w ? 'shot--arch' : ''} />
      </div>
    ));

  return (
    <div className={`wall__row wall__row--${index + 1}`} ref={row}>
      <div className="wall__track" ref={track}>
        {items(0)}
        {!reduced && items(1)}
      </div>
    </div>
  );
}
