import type { CSSProperties } from 'react';
import { useTouchLayout } from '../lib/motion';

/**
 * Text whose words rise through a clipping mask, one after another, on touch layouts
 * (the nearest `.is-in` ancestor, or the Hero's `.is-img`, starts it). Words, never letters:
 * Arabic keeps its shaping and RTL order. Each word gets a slightly different duration.
 * Elsewhere it is plain text.
 */
export function Words({ text }: { text: string }) {
  const touch = useTouchLayout();
  if (!touch) return <>{text}</>;
  return (
    <>
      {text.split(' ').map((w, i, all) => (
        <span key={i}>
          <span className="rvm">
            <span className="rvm__i" style={{ ['--w']: i, ['--dv']: `${((i * 7) % 4) * 0.09}s` } as CSSProperties}>
              {w}
            </span>
          </span>
          {i < all.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  );
}
