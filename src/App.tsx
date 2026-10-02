import { useCallback, useEffect, useState } from 'react';
import type { Photo } from './content/photos';
import { phone } from './content/site';
import { About } from './components/About';
import { Journey } from './components/Journey';
import { Services } from './components/Services';
import { Archive } from './components/Archive';
import { Churches } from './components/Churches';
import { Candlelight } from './components/Candlelight';
import { Ceilings } from './components/Ceilings';
import { Contact } from './components/Contact';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IconWhatsApp } from './components/Icons';
import { Lightbox } from './components/Lightbox';
import { Motifs } from './components/Motifs';
import { Pope } from './components/Pope';
import { Process } from './components/Process';
import { Sanctuary } from './components/Sanctuary';
import { ViewerContext } from './components/Shot';
import { Statement } from './components/Statement';
import { Wall } from './components/Wall';
import { subscribe, useTouchReveal } from './lib/motion';
import { PrefsProvider, usePrefs } from './lib/prefs';

/** A small WhatsApp button that follows the visitor once past the opening, until the contact panel is in view. */
function QuickContact() {
  const { t } = usePrefs();
  const [show, setShow] = useState(false);
  useEffect(
    () =>
      subscribe(() => {
        const page = document.querySelector('main.page');
        const nearEnd = page ? page.getBoundingClientRect().bottom < window.innerHeight * 1.15 : false;
        setShow(window.scrollY > window.innerHeight * 2.5 && !nearEnd);
      }),
    [],
  );
  return (
    <a
      className={`quick ${show ? 'is-shown' : ''}`}
      href={phone.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.contact.whatsapp}
      tabIndex={show ? 0 : -1}
    >
      <IconWhatsApp />
    </a>
  );
}

function Site() {
  const [viewer, setViewer] = useState<{ list: Photo[]; index: number } | null>(null);
  const open = useCallback((list: Photo[], index: number) => setViewer({ list, index }), []);
  useTouchReveal();

  return (
    <ViewerContext.Provider value={open}>
      <Header />
      <main id="top" className="page">
        <Hero />
        <Statement />
        <About />
        <Journey />
        <Services />
        <Sanctuary />
        <Candlelight />
        <Motifs />
        <Ceilings />
        <Process />
        <Wall />
        <Churches />
        <Pope />
        <Archive />
      </main>
      <Contact />
      <QuickContact />
      {viewer && (
        <Lightbox
          list={viewer.list}
          index={viewer.index}
          onIndex={(index) => setViewer((v) => (v ? { ...v, index } : v))}
          onClose={() => setViewer(null)}
        />
      )}
      <div className="grain" aria-hidden="true" />
    </ViewerContext.Provider>
  );
}

export default function App() {
  return (
    <PrefsProvider>
      <Site />
    </PrefsProvider>
  );
}
