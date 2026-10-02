import { useEffect, useState } from 'react';
import { nav } from '../content/site';
import { subscribe } from '../lib/motion';
import { usePrefs } from '../lib/prefs';
import { IconClose, IconMenu, IconMoon, IconSun } from './Icons';

function Toggles({ className = '' }: { className?: string }) {
  const { t, lang, setLang, theme, setTheme } = usePrefs();
  return (
    <div className={`toggles ${className}`}>
      <button
        type="button"
        className="toggle toggle--lang"
        onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
        aria-label={t.ui.langSwitchLabel}
        lang={lang === 'en' ? 'ar' : 'en'}
      >
        {t.ui.langSwitch}
      </button>
      <button
        type="button"
        className="toggle toggle--theme"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? t.ui.toLight : t.ui.toDark}
        title={theme === 'dark' ? t.ui.toLight : t.ui.toDark}
      >
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>
    </div>
  );
}

export function Header() {
  const { t } = usePrefs();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    return subscribe(() => {
      const y = window.scrollY;
      setSolid(y > window.innerHeight * 0.6);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > window.innerHeight * 0.9);
        last = y;
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <a href="#archive" className="skip">
        {t.ui.skip}
      </a>
      <header className={`hdr ${solid ? 'is-solid' : ''} ${hidden && !open ? 'is-hidden' : ''}`}>
        <a href="#top" className="hdr__brand" aria-label={t.ui.backTop}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt={t.ui.logoAlt} width={276} height={400} />
        </a>
        <nav className="hdr__nav" aria-label={t.ui.sections}>
          {nav.map((id) => (
            <a key={id} href={`#${id}`}>
              {t.nav[id]}
            </a>
          ))}
        </nav>
        <div className="hdr__end">
          <Toggles />
          <button type="button" className="hdr__menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
            {open ? <IconClose /> : <IconMenu />}
            <span className="sr">{open ? t.ui.closeMenu : t.ui.openMenu}</span>
          </button>
        </div>
      </header>
      <div id="menu" className={`menu ${open ? 'is-open' : ''}`} inert={!open}>
        <nav aria-label={t.ui.sections}>
          {nav.map((id, i) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} style={{ transitionDelay: `${0.05 + i * 0.05}s` }}>
              {t.nav[id]}
            </a>
          ))}
        </nav>
        <p>{t.contact.rights}</p>
      </div>
    </>
  );
}
