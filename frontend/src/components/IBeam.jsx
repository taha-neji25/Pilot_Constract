// Signature graphic: an I-beam cross-section, reused as a divider,
// bullet marker, and loading accent throughout the site.
export default function IBeam({ className = "" }) {
  return (
    <svg
      className={`i-beam ${className}`}
      viewBox="0 0 22 14"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="22" height="2.4" />
      <rect x="9.2" y="0" width="3.6" height="14" />
      <rect x="0" y="11.6" width="22" height="2.4" />
    </svg>
  );
}
