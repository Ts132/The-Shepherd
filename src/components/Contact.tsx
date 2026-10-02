import { useRef, type ReactNode } from 'react';
import { contact, phone, type ContactKind } from '../content/site';
import { usePrefs } from '../lib/prefs';
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
  const year = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', { useGrouping: false }).format(new Date().getFullYear());
  const valueFor = (kind: ContactKind, value: string | null) =>
    value ?? (kind === 'facebook' ? t.contact.facebookValue : kind === 'location' ? t.contact.locationValue : '');

  return (
    <footer id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact__inner">
        <span className="contact__omega" aria-hidden="true" lang="cop">
          Ⲱ
        </span>
        <div className="contact__main">
          <h2 id="contact-title" className="contact__title">
            {t.contact.title}
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
          {contact.map((c) => (
            <li key={c.kind}>
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
