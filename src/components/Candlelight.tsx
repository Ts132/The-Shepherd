import { useEffect, useRef } from 'react';
import { byId, src } from '../content/photos';
import { useReducedMotion } from '../lib/motion';
import { usePrefs } from '../lib/prefs';

const PANEL = byId('w800');

/**
 * A carved panel in near darkness. The pointer (or a slowly drifting flame, when
 * nobody is touching it) carries a pool of warm light across the relief.
 */
export function Candlelight() {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { t } = usePrefs();

  useEffect(() => {
    const el = stage.current;
    if (!el || reduced) return;
    let visible = false;
    let raf = 0;
    const pos = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    let lastInput = -1e9;
    const t0 = performance.now();

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      const idle = now - lastInput > 2600;
      if (idle) {
        const t = (now - t0) / 1000;
        target.x = 0.5 + Math.sin(t * 0.23) * 0.3 + Math.sin(t * 0.61) * 0.05;
        target.y = 0.5 + Math.sin(t * 0.17 + 1.3) * 0.22;
      }
      const k = idle ? 0.025 : 0.12;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      // a breath of flicker in the radius
      const f = Math.sin(now / 90) * 0.6 + Math.sin(now / 37) * 0.4;
      el.style.setProperty('--x', `${(pos.x * 100).toFixed(2)}%`);
      el.style.setProperty('--y', `${(pos.y * 100).toFixed(2)}%`);
      el.style.setProperty('--flick', f.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(el);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
      lastInput = performance.now();
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onMove);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onMove);
    };
  }, [reduced]);

  return (
    <section className={`candle ${reduced ? 'candle--still' : ''}`} aria-labelledby="candle-title">
      <div className="candle__stage" ref={stage}>
        <img className="candle__dark" src={src(PANEL, 'l')} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <img
          className="candle__lit"
          src={src(PANEL, 'l')}
          alt={t.candle.alt}
          loading="lazy"
          decoding="async"
        />
        <div className="candle__words">
          <h2 id="candle-title" className="display display--sm">
            {t.candle.title}
          </h2>
          <p>{t.candle.text}</p>
        </div>
      </div>
    </section>
  );
}
