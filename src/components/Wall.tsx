import { useEffect, useMemo, useRef } from 'react';
import { photos, type Photo } from '../content/photos';
import { subscribeLoop, subscribeViewport, useMediaQuery, useReducedMotion } from '../lib/motion';
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
/** Phones draw fewer photos per row: the full set stays reachable in the viewer and the archive. */
const PER_ROW_COMPACT = 12;

/**
 * Three rows of photographs drifting past in alternate directions. Scrolling the
 * page speeds them up (in the scroll direction); hovering a row lets it come to rest.
 */
export function Wall() {
  const { t } = usePrefs();
  const reduced = useReducedMotion();
  const compact = useMediaQuery('(max-width: 759px)');
  const touch = useMediaQuery('(hover: none), (pointer: coarse)');
  return (
    <section id="wall" className={`wall ${reduced ? 'wall--still' : ''}`} aria-labelledby="wall-title">
      <header className="wall__head">
        <Echo text={t.wall.echo} />
        <h2 id="wall-title" className="display" data-rv="title">
          {t.wall.title}
        </h2>
        <p className="lede">{t.wall.lede}</p>
      </header>
      <div className="wall__rows">
        {rows.map((r, i) => (
          <Row key={i} photos={compact ? r.slice(0, PER_ROW_COMPACT) : r} index={i} reduced={reduced} compact={compact} touch={touch} />
        ))}
      </div>
    </section>
  );
}

function Row({
  photos: list,
  index,
  reduced,
  compact,
  touch,
}: {
  photos: Photo[];
  index: number;
  reduced: boolean;
  compact: boolean;
  touch: boolean;
}) {
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
    let visible = false;
    let off: (() => void) | null = null;
    let half = 0;
    // Read the loop length once (and when sizes change) instead of forcing layout every frame.
    const measure = () => {
      half = tr.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    const offViewport = subscribeViewport(measure);
    // ~30fps on phones: half the work, still smooth for a slow drift.
    const minGap = compact ? 30 : 0;

    const loop = (now: number) => {
      if (document.hidden || now - lastT < minGap) return;
      const dt = Math.min(64, now - lastT);
      lastT = now;
      speed += (target - speed) * 0.06;
      if (!touch) {
        // Pointer devices: scrolling the page nudges the drift. Touch scrolling never touches it.
        const y = window.scrollY;
        boost = Math.max(-1.2, Math.min(1.2, boost + (y - lastY) * 0.004));
        lastY = y;
      }
      boost *= 0.92;
      x += baseDir * (0.035 * speed + boost) * dt;
      if (half > 0) {
        if (x <= -half) x += half;
        if (x > 0) x -= half;
      }
      tr.style.transform = `translate3d(${x}px,0,0)`;
    };
    // Rows only join the page's shared frame loop while they are on screen.
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !off) {
          lastT = performance.now();
          lastY = window.scrollY;
          off = subscribeLoop(loop);
        } else if (!visible && off) {
          off();
          off = null;
        }
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(rw);
    // Hover/focus pause is for pointer devices only: on touch it would leave a row stuck after a tap.
    const pause = () => (target = 0);
    const resume = () => (target = 1);
    if (!touch) {
      rw.addEventListener('pointerenter', pause);
      rw.addEventListener('pointerleave', resume);
      rw.addEventListener('focusin', pause);
      rw.addEventListener('focusout', resume);
    }
    return () => {
      io.disconnect();
      ro.disconnect();
      offViewport();
      off?.();
      rw.removeEventListener('pointerenter', pause);
      rw.removeEventListener('pointerleave', resume);
      rw.removeEventListener('focusin', pause);
      rw.removeEventListener('focusout', resume);
    };
  }, [reduced, index, dir, compact, touch]);

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
