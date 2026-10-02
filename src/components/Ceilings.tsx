import { useEffect, useRef } from 'react';
import { byId } from '../content/photos';
import { lerp, usePassProgress, useReducedMotion } from '../lib/motion';
import { Shot } from './Shot';
import { Echo } from './Echo';
import { usePrefs } from '../lib/prefs';

const IDS = ['w061', 'w059', 'w142', 'w669'];
const photos = IDS.map(byId);
const base = import.meta.env.BASE_URL;

export function Ceilings() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const cols = useRef<HTMLDivElement[]>([]);
  const reduced = useReducedMotion();
  const { t } = usePrefs();

  usePassProgress(
    section,
    (p) => {
      if (video.current) video.current.style.transform = `scale(${lerp(1.25, 1.02, p)})`;
      cols.current.forEach((c, i) => {
        if (c) c.style.transform = `translate3d(0, ${(0.5 - p) * (i % 2 ? 140 : 60)}px, 0)`;
      });
    },
    !reduced,
  );

  // Only play the loop while it is on screen.
  useEffect(() => {
    const v = video.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section ref={section} className="ceil" aria-labelledby="ceil-title">
      <div className="ceil__film">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="metadata"
          poster={`${base}video/ceiling-poster.webp`}
          aria-hidden="true"
        >
          <source src={`${base}video/ceiling.mp4`} type="video/mp4" />
          <source src={`${base}video/ceiling.webm`} type="video/webm" />
        </video>
      </div>
      <div className="ceil__inner">
        <header className="ceil__head">
          <Echo text={t.ceilings.echo} />
          <h2 id="ceil-title" className="display">
            {t.ceilings.title}
          </h2>
          <p className="lede">{t.ceilings.lede}</p>
        </header>
        <div className="ceil__row">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className="ceil__col"
              ref={(el) => {
                if (el) cols.current[i] = el;
              }}
            >
              <Shot photo={p} sequence={photos} size="s" className="shot--arch" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
