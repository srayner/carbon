/**
 * The Carbon mark: a hexagon with a centre dot, drawn in the current text
 * colour so it follows light and dark mode. See docs/brand for the family.
 */
const LogoMark = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="-56 -56 112 112" aria-hidden="true" className={className}>
      <polygon
        points="0,-42 36.4,-21 36.4,21 0,42 -36.4,21 -36.4,-21"
        fill="none"
        stroke="currentColor"
        strokeWidth={12}
        strokeLinejoin="round"
      />
      <circle r={7} fill="currentColor" />
    </svg>
  );
};

export default LogoMark;
