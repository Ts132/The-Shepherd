import { useRef } from 'react';
import { byId } from '../content/photos';
import { useInView, usePassProgress, useReducedMotion } from '../lib/motion';
import { Shot } from './Shot';
import { Echo } from './Echo';
import { usePrefs } from '../lib/prefs';

const MOTIFS = [
  { id: 'w364', speed: -6 },
  { id: 'w354', speed: 8 },
  { id: 'w795', speed: -10 },
  { id: 'w802', speed: 4 },
  { id: 'w644', speed: -4 },
  { id: 'w589', speed: 10 },
  { id: 'w639', speed: -8 },
  { id: 'w540', speed: 6 },
];
const photos = MOTIFS.map((m) => byId(m.id));

function Motif({ i }: { i: number }) {
  const m = MOTIFS[i];
  const reduced = useReducedMotion();
  const { t } = usePrefs();
  const [name, text] = t.motifs.items[i];
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.25 });
  const media = useRef<HTMLDivElement>(null);
  usePassProgress(
    ref,
    (p) => {
      if (media.current) media.current.style.transform = `translate3d(0, ${(p - 0.5) * m.speed * 6}px, 0)`;
    },
    !reduced,
  );
  return (
    <figure ref={ref} className={`motif motif--${i + 1} ${inView || reduced ? 'is-in' : ''}`}>
      <div className="motif__inner" ref={media}>
        <Shot photo={photos[i]} sequence={photos} size="l" alt={name} />
        <figcaption>
          <h3>{name}</h3>
          <p>{text}</p>
        </figcaption>
      </div>
    </figure>
  );
}

export function Motifs() {
  const { t } = usePrefs();
  return (
    <section id="motifs" className="motifs" aria-labelledby="motifs-title">
      <header className="motifs__head">
        <Echo text={t.motifs.echo} />
        <h2 id="motifs-title" className="display" data-rv="title">
          {t.motifs.title}
        </h2>
        <p className="lede">{t.motifs.lede}</p>
      </header>
      <div className="motifs__grid">
        {MOTIFS.map((m, i) => (
          <Motif key={m.id} i={i} />
        ))}
      </div>
    </section>
  );
}
