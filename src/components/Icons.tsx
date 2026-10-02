/* Minimal line icons, drawn on a 24px grid with a 1.5 stroke. */
const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

/** Points along the reading direction: "forward" is right in English and left in Arabic (see .dir-icon in CSS). */
export const IconArrow = ({ dir = 'forward' }: { dir?: 'forward' | 'back' }) => (
  <svg {...base} className="dir-icon">
    {dir === 'forward' ? <path d="M4 12h15M13 6l6 6-6 6" /> : <path d="M20 12H5M11 6l-6 6 6 6" />}
  </svg>
);
export const IconSun = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
);
export const IconMoon = () => (
  <svg {...base}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
);
export const IconWhatsApp = () => (
  <svg {...base}>
    <path d="M4.5 19.5l1.1-3.9A8 8 0 1 1 8.6 18.4z" />
    <path d="M9.2 8.6c.2-.5.5-.5.8-.5h.4c.2 0 .4 0 .5.4l.6 1.4c.1.2 0 .4-.1.6l-.4.5c-.1.1-.2.3 0 .5.4.7 1.4 1.8 2.6 2.3.2.1.4 0 .5-.1l.5-.6c.2-.2.4-.2.6-.1l1.4.7c.2.1.4.2.4.4 0 .5-.2 1.2-.8 1.5-.6.4-1.6.5-3.3-.2-2-.9-3.4-2.9-3.6-3.3-.3-.4-.8-1.5-.5-2.5z" fill="currentColor" stroke="none" />
  </svg>
);
export const IconClose = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconMenu = () => (
  <svg {...base}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);
export const IconPhone = () => (
  <svg {...base}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);
export const IconPin = () => (
  <svg {...base}>
    <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
export const IconCamera = () => (
  <svg {...base}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
  </svg>
);
export const IconPage = () => (
  <svg {...base}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M15 21v-7h3l.5-3H15V9.5c0-1 .4-1.5 1.5-1.5H18V5.2A15 15 0 0 0 16 5c-2.5 0-4 1.4-4 4v2H9v3h3v7" />
  </svg>
);
