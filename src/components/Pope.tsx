import { useRef, useState } from 'react';
import { byId } from '../content/photos';
import { popeFilm, popePhotoIds } from '../content/pope';
import { useInView } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Echo } from './Echo';
import { Words } from './Words';
import { Shot } from './Shot';

const base = import.meta.env.BASE_URL;
const photos = popePhotoIds.map(byId);

/**
 * A dedicated, quiet section for His Holiness Pope Tawadros II:
 * the film inside a gilded arch, flanked by photographs.
 */
export function Pope() {
  const { t } = usePrefs();
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.15 });
  const left = photos.filter((_, i) => i % 2 === 0).slice(0, 2);
  const right = photos.filter((_, i) => i % 2 === 1).slice(0, 2);
  const rest = photos.slice(4);

  const play = () => {
    const v = video.current;
    if (!v) return;
    setStarted(true);
    v.play().catch(() => {});
  };

  return (
    <section id="pope" ref={ref} className={`pope ${inView ? 'is-in' : ''}`} aria-labelledby="pope-title">
      <div className="pope__glow" aria-hidden="true" />
      <header className="pope__head">
        <Echo text={t.pope.echo} />
        <h2 id="pope-title" className="pope__title">
          <Words text={t.pope.title} />
        </h2>
        <p className="pope__sub">{t.pope.sub}</p>
        <span className="pope__rule" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 3v18M6 9h12" />
          </svg>
        </span>
        <p className="lede pope__lede">{t.pope.lede}</p>
      </header>

      <div className={`pope__stage ${photos.length ? 'has-photos' : ''}`}>
        {left.length > 0 && (
          <div className="pope__side pope__side--a">
            {left.map((p) => (
              <Shot key={p.id} photo={p} sequence={photos} size="l" className="shot--arch" alt={t.pope.photoAlt} />
            ))}
          </div>
        )}

        <figure className="pope__film">
          <div className="pope__frame">
            <video
              ref={video}
              poster={`${base}${popeFilm.poster}`}
              preload="metadata"
              playsInline
              controls={started}
              aria-label={t.pope.filmLabel}
              onPlay={() => setStarted(true)}
            >
              <source src={`${base}${popeFilm.src}`} type="video/mp4" />
              <source src={`${base}${popeFilm.webm}`} type="video/webm" />
            </video>
            {!started && (
              <button type="button" className="pope__play" onClick={play} aria-label={t.pope.play}>
                <span className="pope__play-ring" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
                    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                  </svg>
                </span>
                <span className="pope__play-label">{t.pope.play}</span>
              </button>
            )}
          </div>
        </figure>

        {right.length > 0 && (
          <div className="pope__side pope__side--b">
            {right.map((p) => (
              <Shot key={p.id} photo={p} sequence={photos} size="l" className="shot--arch" alt={t.pope.photoAlt} />
            ))}
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <div className="pope__more">
          {rest.map((p) => (
            <Shot key={p.id} photo={p} sequence={photos} natural alt={t.pope.photoAlt} />
          ))}
        </div>
      )}
    </section>
  );
}
