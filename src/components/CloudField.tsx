/**
 * The sky the whole product sits in.
 *
 * The landing hero draws its own clouds with framer-motion (see Hero's
 * FloatingCloud), because those react to the page load. Everything else,
 * the dashboard, the 404, the static pages, gets this: a fixed, purely
 * decorative layer of puffy clouds drifting slowly left to right behind
 * the content.
 *
 * It is `fixed inset-0 -z-10` and `pointer-events-none`, so it never
 * interferes with layout or input. Each cloud is a `.cloud-shape` (a
 * circle plus four box-shadow lobes) on its own drift track, offset by a
 * negative animation-delay so the field starts mid-flight rather than
 * empty.
 */

interface Cloud {
  /** Vertical position, as a percentage of the viewport. */
  top: number;
  /** Base lobe size in px. The box-shadow lobes scale from this. */
  size: number;
  /** Seconds for one left-to-right pass. Bigger clouds drift slower. */
  duration: number;
  /** Negative offset so the sky is already populated on first paint. */
  delay: number;
  opacity: number;
}

const CLOUDS: Cloud[] = [
  { top: 6, size: 46, duration: 74, delay: -4, opacity: 0.85 },
  { top: 18, size: 30, duration: 96, delay: -38, opacity: 0.6 },
  { top: 31, size: 58, duration: 62, delay: -21, opacity: 0.75 },
  { top: 47, size: 26, duration: 108, delay: -66, opacity: 0.5 },
  { top: 58, size: 42, duration: 82, delay: -12, opacity: 0.65 },
  { top: 72, size: 34, duration: 90, delay: -49, opacity: 0.55 },
  { top: 86, size: 52, duration: 68, delay: -30, opacity: 0.7 },
];

const CloudField = ({ className = "" }: { className?: string }) => (
  <div
    className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
    aria-hidden="true"
  >
    {CLOUDS.map((c, i) => (
      <span
        key={i}
        className="cloud-shape animate-cloud-drift absolute blur-[1px]"
        style={{
          top: `${c.top}%`,
          left: 0,
          width: c.size,
          height: c.size * 0.62,
          opacity: c.opacity,
          animationDuration: `${c.duration}s`,
          animationDelay: `${c.delay}s`,
        }}
      />
    ))}
  </div>
);

export default CloudField;
