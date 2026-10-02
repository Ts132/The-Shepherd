import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { photos, type Photo } from '../content/photos';
import { fmt } from '../content/strings';
import { categoryIds } from '../content/site';
import { caption } from '../lib/caption';
import { useMediaQuery, useReducedMotion } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';
import { Shot } from './Shot';

const PAGE = 36;
const ROW = 8; // px: the grid's row unit; each tile spans as many rows as its height needs
const GAP = 16;

/**
 * The full archive as an exhibition wall: a dense grid where every photograph keeps
 * its own proportions, and the finest pieces are hung twice as large.
 */
export function Archive() {
  const { t, lang, num } = usePrefs();
  const reduced = useReducedMotion();
  const [cat, setCat] = useState<string>('all');
  const [shown, setShown] = useState(PAGE);
  const wide = useMediaQuery('(min-width: 1100px)');
  const mid = useMediaQuery('(min-width: 700px)');
  const ncols = wide ? 5 : mid ? 3 : 2;
  const grid = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const [colW, setColW] = useState(0);

  const list = useMemo(() => (cat === 'all' ? interleave(photos) : photos.filter((p) => p.cat === cat)), [cat]);
  const visible = list.slice(0, shown);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: photos.length };
    photos.forEach((p) => (c[p.cat] = (c[p.cat] ?? 0) + 1));
    return c;
  }, []);

  useLayoutEffect(() => {
    const el = grid.current;
    if (!el) return;
    const measure = () => {
      if (el.isConnected && el.clientWidth > 0) setColW((el.clientWidth - GAP * (ncols - 1)) / ncols);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ncols, cat]);

  // Keep loading as the visitor reaches the end of the wall.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        // Fill in the first few pages automatically; after that the visitor chooses to see more,
        // so the contact section below always stays within reach.
        if (e.isIntersecting) setShown((s) => (s < PAGE * 3 ? Math.min(list.length, s + PAGE) : s));
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [list.length, shown]);

  // Unveil tiles as they arrive on screen.
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        let k = 0;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const tile = e.target as HTMLElement;
          tile.style.transitionDelay = reduced ? '0s' : `${Math.min(k++, 6) * 70}ms`;
          tile.classList.add('is-in');
          io.unobserve(tile);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );
    el.querySelectorAll('.ex__tile:not(.is-in)').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [visible.length, cat, colW, reduced]);

  return (
    <section id="archive" className="arch" aria-labelledby="arch-title">
      <header className="arch__head">
        <div>
          <Echo text={t.archive.echo} />
          <h2 id="arch-title" className="display">
            {t.archive.title}
          </h2>
          <p className="lede">{fmt(t.archive.lede, { n: num(photos.length) })}</p>
        </div>
        <div className="arch__filters" role="group" aria-label={t.archive.filter}>
          {categoryIds.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={cat === c}
              onClick={() => {
                setCat(c);
                setShown(PAGE);
              }}
            >
              {t.cats[c]}
              <sup>{num(counts[c] ?? 0)}</sup>
            </button>
          ))}
        </div>
      </header>

      <div className="ex" ref={grid} key={cat} style={{ ['--cols' as string]: ncols, ['--row' as string]: `${ROW}px`, ['--gap' as string]: `${GAP}px` }}>
        {colW > 0 &&
          visible.map((p, i) => {
            const span = ncols >= 3 && isHero(p, i) ? 2 : 1;
            const w = colW * span + GAP * (span - 1);
            const rows = Math.max(8, Math.round((w * (p.h / p.w) + GAP) / ROW));
            return (
              <figure
                key={p.id}
                className={`ex__tile ${span === 2 ? 'ex__tile--hero' : ''}`}
                style={{ gridColumn: `span ${span}`, gridRowEnd: `span ${rows}` }}
              >
                <Shot photo={p} sequence={list} size={span === 2 ? 'l' : 's'} className={archTop(p, i) ? 'shot--arch' : ''} />
                <figcaption>
                  <span className="ex__cat">{t.cats[p.cat]}</span>
                  {p[lang] && <span className="ex__cap">{caption(p, lang, t)}</span>}
                </figcaption>
              </figure>
            );
          })}
      </div>

      <div ref={sentinel} className="arch__sentinel" aria-hidden="true" />
      {shown < list.length && (
        <div className="arch__more">
          <button type="button" className="btn btn--ghost" onClick={() => setShown((s) => s + PAGE)}>
            {fmt(t.archive.more, { n: num(Math.min(PAGE, list.length - shown)) })}
            <span className="btn__count">{fmt(t.archive.of, { a: num(shown), b: num(list.length) })}</span>
          </button>
        </div>
      )}
    </section>
  );
}

/** The finest pieces hang twice as large: the curated photographs, at a steady rhythm. */
function isHero(p: Photo, i: number) {
  return !!p.featured && i % 4 === 0;
}
/** A few tall photos get the arch-topped frame, echoing the logo. */
function archTop(p: Photo, i: number) {
  return p.h > p.w * 1.2 && i % 7 === 3;
}

/** Mix the categories so the unfiltered archive does not read as blocks; curated photos lead. */
function interleave(all: Photo[]) {
  const groups = new Map<string, Photo[]>();
  const ordered = [...all.filter((p) => p.featured), ...all.filter((p) => !p.featured)];
  ordered.forEach((p) => groups.set(p.cat, [...(groups.get(p.cat) ?? []), p]));
  const out: Photo[] = [];
  const g = [...groups.values()];
  for (let i = 0; out.length < all.length; i++) g.forEach((arr) => arr[i] && out.push(arr[i]));
  return out;
}
