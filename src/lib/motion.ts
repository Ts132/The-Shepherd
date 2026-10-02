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

function frame() {
  raf = 0;
  if (!dirty) return;
  dirty = false;
  ticks.forEach((t) => t());
}
function request() {
  dirty = true;
  if (!raf) raf = requestAnimationFrame(frame);
}
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
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
export function useSectionProgress(ref: RefObject<HTMLElement | null>, cb: (p: number) => void, enabled = true) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!enabled) return;
    return subscribe(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      cbRef.current(total > 0 ? clamp(-r.top / total) : r.top < 0 ? 1 : 0);
    });
  }, [ref, enabled]);
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
