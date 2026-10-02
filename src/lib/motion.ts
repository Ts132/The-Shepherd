import { useEffect, useRef, useState, type RefObject } from 'react';

/* ------------------------------------------------------------------ */
/* One shared rAF loop drives every scroll-linked effect on the page. */
/* Effects write straight to the DOM (transforms, CSS variables), so   */
/* scrolling never re-renders React.                                   */
/* ------------------------------------------------------------------ */

type Tick = () => void;
const ticks = new Set<Tick>();
let raf = 0;
let dirty = true;

/** Continuous per-frame callbacks (e.g. the drifting wall), driven by the same single rAF. */
type Loop = (now: number) => void;
const loops = new Set<Loop>();

function frame(now: number) {
  raf = 0;
  if (dirty) {
    dirty = false;
    // One failing effect must never stop the others (or leave the page stuck).
    ticks.forEach((t) => {
      try {
        t();
      } catch {
        /* the page stays readable without this effect */
      }
    });
  }
  loops.forEach((l) => {
    try {
      l(now);
    } catch {
      /* ignore */
    }
  });
  if (loops.size) raf = requestAnimationFrame(frame);
}
function request() {
  dirty = true;
  if (!raf) raf = requestAnimationFrame(frame);
}
/** Run `fn` every frame until unsubscribed. Shares the page's one rAF instead of starting another. */
export function subscribeLoop(fn: Loop) {
  loops.add(fn);
  if (!raf) raf = requestAnimationFrame(frame);
  return () => {
    loops.delete(fn);
  };
}

/* ------------------------------------------------------------------ */
/* Stable viewport height.                                             */
/* Sticky stages are sized with CSS `100svh` (the small viewport, i.e. */
/* the browser UI fully shown). `innerHeight` changes as a mobile URL  */
/* bar collapses, so JS must measure the same unit the CSS uses.       */
/* ------------------------------------------------------------------ */
let probe: HTMLDivElement | null = null;
let vhCache = 0;
/** Height of 100svh in px (falls back to innerHeight where svh is unsupported). */
export function stableVh() {
  if (vhCache) return vhCache;
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
  }
  vhCache = probe.offsetHeight || window.innerHeight;
  return vhCache;
}
/** Width the page is laid out in (excludes a desktop scrollbar). */
export const stableVw = () => document.documentElement.clientWidth || window.innerWidth;

const viewportSubs = new Set<() => void>();
let viewportSig = '';
function viewportChanged(force = false) {
  vhCache = 0;
  const sig = `${stableVw()}x${stableVh()}`;
  if (!force && sig === viewportSig) return; // e.g. the URL bar moving: nothing to re-measure
  viewportSig = sig;
  viewportSubs.forEach((f) => {
    try {
      f();
    } catch {
      /* ignore */
    }
  });
  request();
}
/**
 * Calls `cb` when the layout size really changed, and again once fonts and
 * images have finished loading (late-arriving assets change layout).
 */
export function subscribeViewport(cb: () => void) {
  viewportSubs.add(cb);
  return () => {
    viewportSubs.delete(cb);
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', () => viewportChanged());
  window.addEventListener('orientationchange', () => viewportChanged());
  window.addEventListener('load', () => viewportChanged(true));
  document.fonts?.ready.then(() => viewportChanged(true)).catch(() => {});
  document.fonts?.addEventListener?.('loadingdone', () => viewportChanged(true));
}

export function subscribe(t: Tick) {
  ticks.add(t);
  request();
  return () => {
    ticks.delete(t);
  };
}
export const requestTick = request;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Map v from [a,b] to [0,1], clamped. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Progress of a tall "scrollytelling" section: 0 when its top reaches the top
 * of the viewport, 1 when its bottom reaches the bottom of the viewport.
 */
export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  cb: (p: number) => void,
  enabled = true,
  /** Values the callback's output depends on besides progress (e.g. measured geometry). */
  deps: readonly unknown[] = [],
) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!enabled) return;
    let last = -1;
    return subscribe(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = stableVh();
      const total = r.height - vh;
      const p = total > 0 ? clamp(-r.top / total) : r.top < 0 ? 1 : 0;
      // Parked before/after the section: nothing changes, so don't rewrite styles on every touch-scroll frame.
      if (p === last && (p === 0 || p === 1)) return;
      last = p;
      cbRef.current(p);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, enabled, ...deps]);
}

/**
 * Progress of an element passing through the viewport: 0 as its top enters
 * from the bottom, 1 as its bottom leaves at the top. Used for parallax.
 */
export function usePassProgress(ref: RefObject<HTMLElement | null>, cb: (p: number) => void, enabled = true) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!enabled) return;
    return subscribe(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      cbRef.current(clamp((vh - r.top) / (vh + r.height)));
    });
  }, [ref, enabled]);
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Adds `is-in` to the element the first time it is (mostly) on screen. */
export function useInView<T extends HTMLElement>(options: IntersectionObserverInit = { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView] as const;
}

export function useMediaQuery(q: string) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

/** Phones and touch tablets: native scrolling comes first, so no pinned or scroll-driven effects. */
export const TOUCH_QUERY = '(max-width: 759px), (hover: none) and (pointer: coarse)';
export const useTouchLayout = () => useMediaQuery(TOUCH_QUERY);

/* ------------------------------------------------------------------ */
/* One shared IntersectionObserver for every "reveal once" element.    */
/* It only ever adds `is-in`; the look is pure CSS (transform/opacity),*/
/* so there are no scroll handlers and no per-frame work.              */
/* ------------------------------------------------------------------ */
let revealIO: IntersectionObserver | null = null;
export function revealOnce(el: Element) {
  if (typeof IntersectionObserver === 'undefined') {
    el.classList.add('is-in');
    return () => {};
  }
  revealIO ??= new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        revealIO?.unobserve(e.target);
      }),
    { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
  );
  revealIO.observe(el);
  return () => revealIO?.unobserve(el);
}
/** Reveal every `selector` match inside `ref` once, as it first scrolls into view. */
export function useRevealOnce(ref: RefObject<HTMLElement | null>, selector: string, enabled = true) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    const offs = Array.from(root.querySelectorAll(selector), (n) => revealOnce(n));
    return () => offs.forEach((f) => f());
  }, [ref, selector, enabled]);
}

/**
 * Touch layout only: switches on the mobile reveal choreography (`html[data-rv]`) and registers
 * every `[data-rv]` element with the shared observer. With reduced motion, or no
 * IntersectionObserver, the attribute is never set, so every element simply stays visible.
 */
export function useTouchReveal() {
  const touch = useTouchLayout();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!touch || reduced || typeof IntersectionObserver === 'undefined') return;
    const html = document.documentElement;
    html.dataset.rv = 'on';
    const offs = Array.from(document.querySelectorAll('[data-rv]'), (n) => revealOnce(n));
    return () => {
      offs.forEach((f) => f());
      delete html.dataset.rv;
    };
  }, [touch, reduced]);
}
