import { useTouchLayout } from '../lib/motion';

/**
 * A heading whose words rise in one after another on touch layouts (the parent gets `is-in`).
 * Words, never letters: Arabic keeps its shaping and RTL order. Elsewhere it is plain text.
 */
export function Words({ text }: { text: string }) {
  const touch = useTouchLayout();
  if (!touch) return <>{text}</>;
  return (
    <>
      {text.split(' ').map((w, i, all) => (
        <span key={i}>
          <span className="rvw" style={{ ['--w' as string]: i }}>
            {w}
          </span>
          {i < all.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  );
}
