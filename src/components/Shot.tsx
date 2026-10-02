import { createContext, useContext, useState, type CSSProperties } from 'react';
import { src, type Photo } from '../content/photos';
import { caption } from '../lib/caption';
import { usePrefs } from '../lib/prefs';

/** Lets any photo on the page open the fullscreen viewer on a given sequence. */
export const ViewerContext = createContext<(list: Photo[], index: number) => void>(() => {});
export const useViewer = () => useContext(ViewerContext);

interface ShotProps {
  photo: Photo;
  /** The sequence the viewer should step through when this photo is opened. */
  sequence?: Photo[];
  size?: 's' | 'l';
  className?: string;
  style?: CSSProperties;
  /** Use the photo's own aspect ratio (otherwise the container decides). */
  natural?: boolean;
  eager?: boolean;
  alt?: string;
  tabIndex?: number;
}

export function Shot({ photo, sequence, size = 's', className = '', style, natural, eager, alt, tabIndex }: ShotProps) {
  const open = useViewer();
  const { lang, t } = usePrefs();
  const [ready, setReady] = useState(false);
  const list = sequence ?? [photo];
  const text = alt ?? caption(photo, lang, t);
  return (
    <button
      type="button"
      className={`shot ${ready ? 'is-ready' : ''} ${className}`}
      style={{ ...(natural ? { aspectRatio: `${photo.w} / ${photo.h}` } : null), background: photo.tone, ...style }}
      onClick={() => open(list, Math.max(0, list.indexOf(photo)))}
      aria-label={`${t.ui.viewLarger}: ${text}`}
      tabIndex={tabIndex}
    >
      <img
        src={src(photo, size)}
        width={photo.w}
        height={photo.h}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setReady(true)}
        ref={(el) => {
          if (el?.complete && el.naturalWidth) setReady(true);
        }}
      />
    </button>
  );
}
