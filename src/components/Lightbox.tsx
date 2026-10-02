import { useEffect, useRef, useState } from 'react';
import { src, type Photo } from '../content/photos';
import { fmt } from '../content/strings';
import { caption } from '../lib/caption';
import { usePrefs } from '../lib/prefs';
import { IconArrow, IconClose } from './Icons';

interface Props {
  list: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

export function Lightbox({ list, index, onIndex, onClose }: Props) {
  const { t, lang, dir, num } = usePrefs();
  const photo = list[index];
  const [step, setStep] = useState<1 | -1>(1);
  const [closing, setClosing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const many = list.length > 1;
  const rtl = dir === 'rtl';

  const go = (d: 1 | -1) => {
    if (!many) return;
    setStep(d);
    setLoaded(false);
    onIndex((index + d + list.length) % list.length);
  };
  const jump = (i: number) => {
    if (i === index) return;
    setStep(i > index ? 1 : -1);
    setLoaded(false);
    onIndex(i);
  };
  const close = () => {
    setClosing(true);
    setTimeout(onClose, 280);
  };

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.paddingInlineEnd = `${sbw}px`;
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.paddingInlineEnd = '';
      prevFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      // Arrow keys follow the reading direction: "forward" is left in Arabic.
      else if (e.key === 'ArrowRight') go(rtl ? -1 : 1);
      else if (e.key === 'ArrowLeft') go(rtl ? 1 : -1);
      else if (e.key === 'Home') jump(0);
      else if (e.key === 'End') jump(list.length - 1);
      else if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>('.lb__bar button');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Preload neighbours so stepping through feels instant; keep the filmstrip centred.
  useEffect(() => {
    [1, -1].forEach((d) => {
      const n = list[(index + d + list.length) % list.length];
      if (n) new Image().src = src(n, 'l');
    });
    strip.current
      ?.querySelector<HTMLElement>(`[data-i="${index}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index, list]);

  // Only render a window of thumbnails around the current photo for long sets.
  const W = 40;
  const from = Math.max(0, Math.min(index - W / 2, list.length - W));
  const thumbs = list.slice(from, from + W);
  const text = caption(photo, lang, t);

  return (
    <div
      ref={dialog}
      className={`lb ${closing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${fmt(t.viewer.label, { a: num(index + 1), b: num(list.length) })}: ${text}`}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go((dx < 0) !== rtl ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
        touch.current = null;
      }}
    >
      <div
        className="lb__stage"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <figure className="lb__figure" key={photo.id} style={{ ['--dir' as string]: step * (rtl ? -1 : 1) }}>
          <div className={`lb__imgwrap ${loaded ? 'is-loaded' : ''}`} style={{ aspectRatio: `${photo.w} / ${photo.h}` }}>
            <img src={src(photo, 's')} alt="" aria-hidden="true" className="lb__low" />
            <img
              src={src(photo, 'l')}
              alt={text}
              width={photo.w}
              height={photo.h}
              className="lb__high"
              onLoad={() => setLoaded(true)}
              ref={(el) => {
                if (el?.complete && el.naturalWidth) setLoaded(true);
              }}
              onClick={close}
            />
          </div>
          <figcaption className="lb__cap">
            <span className="lb__cat">{t.cats[photo.cat]}</span>
            {photo[lang] && <span className="lb__text">{text}</span>}
          </figcaption>
        </figure>
      </div>

      {many && (
        <div className="lb__strip" ref={strip} aria-label={t.viewer.strip}>
          {thumbs.map((p, k) => {
            const i = from + k;
            return (
              <button
                key={p.id}
                type="button"
                data-i={i}
                className={`lb__thumb ${i === index ? 'is-current' : ''}`}
                onClick={() => jump(i)}
                aria-label={fmt(t.viewer.label, { a: num(i + 1), b: num(list.length) })}
                aria-current={i === index ? 'true' : undefined}
                tabIndex={-1}
              >
                <img src={src(p, 's')} alt="" loading="lazy" />
              </button>
            );
          })}
        </div>
      )}

      <div className="lb__bar">
        <span className="lb__count" aria-live="polite">
          {num(index + 1)} <i>{t.viewer.of}</i> {num(list.length)}
        </span>
        <div className="lb__nav">
          {many && (
            <>
              <button type="button" className="roundbtn" onClick={() => go(-1)} aria-label={t.viewer.prev}>
                <IconArrow dir="back" />
              </button>
              <button type="button" className="roundbtn" onClick={() => go(1)} aria-label={t.viewer.next}>
                <IconArrow dir="forward" />
              </button>
            </>
          )}
          <button type="button" ref={closeBtn} className="roundbtn" onClick={close} aria-label={t.viewer.close}>
            <IconClose />
          </button>
        </div>
      </div>
    </div>
  );
}
