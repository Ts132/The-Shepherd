import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { byId, src } from '../content/photos';
import { easeInOut, lerp, range, stableVh, stableVw, subscribeViewport, useReducedMotion, useSectionProgress, useTouchLayout } from '../lib/motion';
import { usePrefs } from '../lib/prefs';

const HERO = byId('w726');

interface Geo {
  W: number;
  H: number;
  cx: number;
  by: number; // arch base line
  iw: number; // inner arch width
  ih: number; // inner arch height
  g: number; // gap between concentric arches
  mobile: boolean;
}

function measure(): Geo {
  // Same units as the CSS stage (100svh): immune to the mobile URL bar moving.
  const W = stableVw();
  const H = stableVh();
  const mobile = W < 760;
  const iw = mobile ? Math.min(W * 0.44, H * 0.3) : Math.min(W * 0.26, H * 0.34);
  const ih = iw * 1.5;
  const g = iw * 0.17;
  const by = mobile ? H * 0.66 : H * 0.88;
  return { W, H, cx: W / 2, by, iw, ih, g, mobile };
}

function archPath(cx: number, by: number, w: number, h: number) {
  const x0 = cx - w / 2;
  const r = w / 2;
  const top = by - h;
  return `M${x0},${by} V${top + r} A${r},${r} 0 0 1 ${x0 + w},${top + r} V${by}`;
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const imgInner = useRef<HTMLImageElement>(null);
  const arches = useRef<SVGGElement>(null);
  const words = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // Touch devices: one ordinary full-screen section with an entrance sequence (CSS only), no scroll-driven opening.
  const flat = useTouchLayout();
  const { t, lang } = usePrefs();
  const [geo, setGeo] = useState<Geo | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [imgReady, setImgReady] = useState(false);

  useLayoutEffect(() => {
    setGeo(measure());
    // Re-measure only when the layout size really changes, and once fonts/assets have settled.
    return subscribeViewport(() => setGeo(measure()));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    // The photo fades in when decoded; never wait longer than 1.5s for it.
    const fallback = setTimeout(() => setImgReady(true), 1500);
    return () => {
      clearTimeout(t);
      clearTimeout(fallback);
    };
  }, []);

  useSectionProgress(
    section,
    (p) => {
      if (!geo || !img.current) return;
      const { W, H, cx, by, iw, ih } = geo;
      const e = easeInOut(range(p, 0.02, 0.58));
      const x0 = cx - iw / 2;
      const top = lerp(by - ih, 0, e);
      const left = lerp(x0, 0, e);
      const right = lerp(W - x0 - iw, 0, e);
      const bottom = lerp(H - by, 0, e);
      const r = lerp(iw / 2, 0, e);
      img.current.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${r}px ${r}px 0 0)`;
      const settle = range(p, 0.58, 1);
      const im = imgInner.current;
      if (im) {
        // The photo's own box grows from the arch to the whole screen, so the
        // arch always shows the full composition rather than a zoomed crop.
        const bx = lerp(x0 - iw * 0.08, 0, e);
        const bw = lerp(iw * 1.16, W, e);
        const bt = lerp(by - ih, 0, e);
        const bh = lerp(ih, H, e);
        im.style.left = `${bx}px`;
        im.style.top = `${bt}px`;
        im.style.width = `${bw}px`;
        im.style.height = `${bh}px`;
        im.style.transform = `scale(${1 + settle * 0.06})`;
      }
      if (arches.current) {
        const s = 1 + Math.pow(e, 1.6) * 3.4;
        const cy = by - ih / 2;
        arches.current.style.transform = `translate(${cx}px, ${cy}px) scale(${s}) translate(${-cx}px, ${-cy}px)`;
        arches.current.style.opacity = String(1 - range(p, 0.18, 0.5));
      }
      if (words.current) {
        const t = range(p, 0, 0.22);
        words.current.style.opacity = String(1 - t);
        words.current.style.transform = `translateY(${-t * 40}px)`;
      }
      if (shade.current) shade.current.style.opacity = String(range(p, 0.5, 0.8));
      if (caption.current) {
        const c = range(p, 0.62, 0.8);
        caption.current.style.opacity = String(c);
        caption.current.style.transform = `translateY(${(1 - c) * 24}px)`;
      }
    },
    !reduced && !flat,
  );

  const paths = geo
    ? [0, 1, 2, 3].map((k) => archPath(geo.cx, geo.by, geo.iw + 2 * k * geo.g, geo.ih + k * geo.g * 1.15))
    : [];
  const outer = geo ? { w: geo.iw + 6 * geo.g, h: geo.ih + 3 * geo.g * 1.15 } : null;

  const initialClip = geo
    ? `inset(${geo.by - geo.ih}px ${geo.W - (geo.cx - geo.iw / 2) - geo.iw}px ${geo.H - geo.by}px ${geo.cx - geo.iw / 2}px round ${geo.iw / 2}px ${geo.iw / 2}px 0 0)`
    : undefined;

  return (
    <section
      ref={section}
      className={`hero ${loaded ? 'is-loaded' : ''} ${imgReady ? 'is-img' : ''} ${flat ? 'hero--flat' : ''} ${reduced ? 'hero--still' : ''}`}
      aria-label={t.hero.label}
    >
      <div className="hero__stage" key={flat ? 'flat' : 'full'}>
        <div className="hero__img" ref={img} style={flat ? undefined : { clipPath: initialClip }}>
          <img
            ref={imgInner}
            style={flat ? { left: 0, top: 0, width: '100%', height: '100%' } : geo ? { left: geo.cx - geo.iw * 0.58, top: geo.by - geo.ih, width: geo.iw * 1.16, height: geo.ih } : undefined}
            src={src(HERO, 'l')}
            alt={t.hero.alt}
            fetchPriority="high"
            decoding="async"
            onLoad={() => setImgReady(true)}
          />
          <div className="hero__shade" ref={shade} />
        </div>

        {geo && (
          <svg className="hero__arches" width={geo.W} height={geo.H} viewBox={`0 0 ${geo.W} ${geo.H}`} aria-hidden="true">
            <g ref={arches} style={{ transformOrigin: '0 0' }}>
              {paths.map((d, k) => (
                <path key={k} d={d} pathLength={1} className="hero__arch" style={{ animationDelay: `${0.15 + (3 - k) * 0.22}s` }} />
              ))}
              {outer && (
                <g className="hero__cross" style={{ animationDelay: '1.25s' }}>
                  <path
                    d={`M${geo.cx},${geo.by - outer.h - geo.g * 0.25} V${geo.by - outer.h - geo.g * 1.55} M${geo.cx - geo.g * 0.42},${geo.by - outer.h - geo.g * 1.08} H${geo.cx + geo.g * 0.42}`}
                    pathLength={1}
                  />
                </g>
              )}
              <path
                className="hero__floor"
                d={`M${geo.cx - (outer?.w ?? 0) / 2 - geo.g * 2},${geo.by} H${geo.cx + (outer?.w ?? 0) / 2 + geo.g * 2}`}
                pathLength={1}
              />
            </g>
          </svg>
        )}

        <div className="hero__words" ref={words}>
          <p className="hero__ar" lang={lang === 'en' ? 'ar' : 'en'} dir={lang === 'en' ? 'rtl' : 'ltr'}>
            {t.hero.ar}
          </p>
          <h1 className="hero__title">
            <span className="hero__title-l">{t.hero.titleA}</span>
            <span className="hero__title-r">{t.hero.titleB}</span>
          </h1>
          <div className="hero__cue" aria-hidden="true">
            <span />
          </div>
        </div>

        <p className="hero__caption" ref={caption}>
          {t.hero.caption}
        </p>
      </div>
    </section>
  );
}
