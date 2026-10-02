import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { strings, type Lang, type Strings } from '../content/strings';
import { requestTick } from './motion';

export type Theme = 'dark' | 'light';

interface Prefs {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: Strings;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  /** Format a number in the current language (Arabic-Indic digits in Arabic). */
  num: (n: number) => string;
}

const Ctx = createContext<Prefs | null>(null);

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage unavailable: preference lasts for this visit only */
  }
};

function initialLang(): Lang {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'ar' || q === 'en') return q;
  const saved = read('shepherd-lang');
  if (saved === 'ar' || saved === 'en') return saved;
  return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}
function initialTheme(): Theme {
  const saved = read('shepherd-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = strings[lang];

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
    // scroll-linked effects re-measure once the new layout has rendered
    requestAnimationFrame(() => requestTick());
  }, [lang, dir, t]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1a120c' : '#efe5d3');
  }, [theme]);

  const setLang = useCallback((l: Lang) => {
    write('shepherd-lang', l);
    setLangState(l);
  }, []);
  const setTheme = useCallback((th: Theme) => {
    write('shepherd-theme', th);
    setThemeState(th);
  }, []);

  const num = useMemo(() => {
    const f = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-GB');
    return (n: number) => f.format(n);
  }, [lang]);

  const value = useMemo(() => ({ lang, dir, t, setLang, theme, setTheme, num }) as Prefs, [lang, dir, t, setLang, theme, setTheme, num]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePrefs outside PrefsProvider');
  return v;
}
