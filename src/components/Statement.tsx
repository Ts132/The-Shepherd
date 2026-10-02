import { useRef } from 'react';
import { range, useReducedMotion, useSectionProgress } from '../lib/motion';
import { usePrefs } from '../lib/prefs';

export function Statement() {
  const section = useRef<HTMLElement>(null);
  const words = useRef<HTMLSpanElement[]>([]);
  const alpha = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const { t } = usePrefs();
  const list = t.statement.text.split(' ');
  words.current.length = list.length;

  useSectionProgress(
    section,
    (p) => {
      const n = list.length;
      words.current.forEach((w, i) => {
        if (!w) return;
        const t = range(p * 1.25, i / n, (i + 2.5) / n);
        w.style.opacity = String(0.14 + t * 0.86);
      });
      if (alpha.current) alpha.current.style.transform = `translateY(${(0.5 - p) * 60}px)`;
    },
    !reduced,
  );

  return (
    <section ref={section} className={`statement ${reduced ? 'statement--still' : ''}`} aria-label={t.statement.label}>
      <div className="statement__stage">
        <span className="statement__alpha" ref={alpha} aria-hidden="true" lang="cop">
          Ⲁ
        </span>
        <p className="statement__text" key={t.statement.text}>
          {list.map((w, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) words.current[i] = el;
              }}
            >
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
