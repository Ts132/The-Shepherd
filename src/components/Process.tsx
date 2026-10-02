import { useEffect, useRef, useState } from 'react';
import { byId, src } from '../content/photos';
import { useReducedMotion, useSectionProgress } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';

const base = import.meta.env.BASE_URL;

type Media = { kind: 'img'; id: string } | { kind: 'video'; src: string; poster: string };
const MEDIA: Media[] = [
  { kind: 'img', id: 'w225' },
  { kind: 'video', src: `${base}video/router.mp4`, poster: `${base}video/router-poster.webp` },
  { kind: 'img', id: 'w085' },
  { kind: 'img', id: 'w029' },
];

export function Process() {
  const section = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const reduced = useReducedMotion();
  const { t, num } = usePrefs();
  const steps = t.process.steps;

  useSectionProgress(
    section,
    (p) => {
      const a = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      if (a !== activeRef.current) {
        activeRef.current = a;
        setActive(a);
      }
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
    },
    !reduced,
  );

  const mediaEl = (m: Media, i: number, playing: boolean) =>
    m.kind === 'img' ? (
      <img src={src(byId(m.id), 'l')} alt={steps[i][0]} loading="lazy" decoding="async" />
    ) : (
      <ProcessVideo src={m.src} poster={m.poster} playing={playing} label={t.process.routerAlt} />
    );

  if (reduced) {
    return (
      <section id="process" className="proc proc--still" aria-labelledby="proc-title">
        <Echo text={t.process.echo} />
        <h2 id="proc-title" className="display">
          {t.process.title}
        </h2>
        <ol>
          {steps.map(([title, text], i) => (
            <li key={title}>
              <h3>
                <span className="proc__num">{num(i + 1)}</span> {title}
              </h3>
              <p>{text}</p>
              <div className="proc--still__media">{mediaEl(MEDIA[i], i, false)}</div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section id="process" ref={section} className="proc" style={{ height: `${steps.length * 85 + 40}vh` }} aria-labelledby="proc-title">
      <div className="proc__stage">
        <div className="proc__text">
          <Echo text={t.process.echo} />
          <h2 id="proc-title" className="display display--sm">
            {t.process.title}
          </h2>
          <ol className="proc__steps">
            {steps.map(([title, text], i) => (
              <li key={title} className={i === active ? 'is-active' : i < active ? 'is-past' : ''} aria-current={i === active ? 'step' : undefined}>
                <span className="proc__num" aria-hidden="true">
                  {num(i + 1)}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="proc__rail" aria-hidden="true">
            <span ref={fill} />
          </div>
        </div>
        <div className="proc__media">
          {MEDIA.map((m, i) => (
            <div key={i} className={`proc__layer ${i === active ? 'is-active' : ''}`} aria-hidden={i !== active}>
              {mediaEl(m, i, i === active)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessVideo({ src: s, poster, playing, label }: { src: string; poster: string; playing: boolean; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing]);
  return (
    <video ref={ref} muted loop playsInline preload="none" poster={poster} aria-label={label}>
      <source src={s} type="video/mp4" />
      <source src={s.replace(/\.mp4$/, '.webm')} type="video/webm" />
    </video>
  );
}
