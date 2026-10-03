/**
 * A short label set small above a section title. In English it is the Arabic counterpart of the
 * title; in Arabic it is an Arabic eyebrow. Either way the text is Arabic.
 */
export function Echo({ text }: { text: string }) {
  return (
    <p className="echo echo--ar" aria-hidden="true">
      <bdi lang="ar">{text}</bdi>
    </p>
  );
}
