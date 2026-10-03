import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { contact, phone, type ContactKind } from '../content/site';
import { useTouchLayout } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { Words } from './Words';
import { IconCamera, IconPage, IconPhone, IconPin, IconWhatsApp } from './Icons';

const icons: Record<ContactKind, ReactNode> = {
  phone: <IconPhone />,
  whatsapp: <IconWhatsApp />,
  facebook: <IconPage />,
  instagram: <IconCamera />,
  location: <IconPin />,
};

/** A button that leans a little toward the pointer. */
function Magnetic({ href, className, children, external }: { href: string; className: string; children: ReactNode; external?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      onPointerMove={move}
      onPointerLeave={leave}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
    >
      {children}
    </a>
  );
}

export function Contact() {
  const { t, lang } = usePrefs();
  const root = useRef<HTMLElement>(null);
  const touch = useTouchLayout();

  // Touch: the closing scene plays when the page lifts away (the end-of-page marker comes into view)
  // and replays on a revisit. With no observer it simply shows.
  useEffect(() => {
    const el = root.current;
    if (!el || !touch) return;
    const end = document.getElementById('page-end');
    if (!end || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }
    // The root is extended far upward, so "the end of the page is above me" counts as reached:
    // the scene still plays after a jump to the bottom, and resets when the visitor goes back up.
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-in', e.isIntersecting), {
      rootMargin: '100000px 0px 30% 0px',
    });
    io.observe(end);
    return () => io.disconnect();
  }, [touch]);

  const year = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', { useGrouping: false }).format(new Date().getFullYear());
  const valueFor = (kind: ContactKind, value: string | null) =>
    value ?? (kind === 'facebook' ? t.contact.facebookValue : kind === 'location' ? t.contact.locationValue : '');

  return (
    <footer id="contact" ref={root} className="contact" aria-labelledby="contact-title">
      <div className="contact__inner">
        <span className="contact__omega" aria-hidden="true" lang="cop">
          Ⲱ
        </span>
        <div className="contact__main">
          <h2 id="contact-title" className="contact__title">
            <Words text={t.contact.title} />
          </h2>
          <p className="contact__lede">{t.contact.lede}</p>
          <div className="contact__actions">
            <Magnetic href={phone.whatsapp} className="btn btn--gilt" external>
              <IconWhatsApp /> {t.contact.whatsapp}
            </Magnetic>
            <Magnetic href={phone.tel} className="btn btn--ghost">
              <IconPhone /> {t.contact.call}
            </Magnetic>
          </div>
        </div>
        <ul className="contact__list">
          {contact.map((c, i) => (
            <li key={c.kind} style={{ ['--i' as string]: i } as CSSProperties}>
              <a
                className="contact__row"
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
              >
                <span className="contact__label">
                  {icons[c.kind]}
                  {t.contact.rows[c.kind]}
                </span>
                <span className="contact__value" dir={c.ltr ? 'ltr' : undefined}>
                  {valueFor(c.kind, c.value)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="contact__base">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" aria-hidden="true" />
        <p>
          © {year} {t.contact.rights}
        </p>
        <a href="#top" className="contact__top">
          {t.contact.top}
        </a>
      </div>
    </footer>
  );
}
