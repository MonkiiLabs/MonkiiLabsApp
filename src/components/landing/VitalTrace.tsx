import { useId, useMemo } from "react";

import type { AgentState } from "@/features/api/types";

/* =====================================================================
   The vitality trace.

   This is the one thing on the site that could not belong to another
   product. It is already drawn in the source art: the proof-of-life
   card in the scientist's hand carries an ECG squiggle, and it is the
   most literal possible answer to what Monkii Labs sells: an agent that
   still has a heartbeat.

   It is not decoration, because its shape is a reading. Amplitude and
   beat rate are derived from vitality, so the same component says
   something different at 12% than at 96%:

     thriving   tall, regular, evenly spaced
     idle       shallower, slower, more baseline between beats
     fading     nearly flat, long silences, one weak complex

   It appears at four sizes: the hero instrument, the rule between
   sections, the divider inside a panel, and an inline sparkline on a
   card: and nowhere else. One idea, spent well.
   ===================================================================== */

export type TraceVariant = "instrument" | "rule" | "spark";

/** Beat geometry per state: how many complexes fit, and how tall they run. */
const PULSE: Record<AgentState, { beats: number; amp: number }> = {
  thriving: { beats: 4, amp: 1 },
  idle: { beats: 3, amp: 0.62 },
  fading: { beats: 2, amp: 0.3 },
};

const STROKE: Record<AgentState, string> = {
  thriving: "hsl(var(--alive-lit))",
  idle: "hsl(var(--idle))",
  fading: "hsl(var(--act-lit))",
};

/**
 * One ECG cycle drawn as a polyline: baseline, P wave, the QRS complex,
 * T wave, baseline. The proportions are the real ones, a tall narrow R
 * spike preceded by a small dip: because a stylised zig-zag reads as a
 * mountain range instead of a heartbeat.
 */
function tracePath(width: number, height: number, beats: number, amp: number): string {
  const mid = height / 2;
  const cycle = width / beats;
  const a = (height / 2 - 1) * amp;

  let d = `M0 ${mid}`;
  for (let i = 0; i < beats; i += 1) {
    const at = (f: number) => (i * cycle + cycle * f).toFixed(2);
    const y = (k: number) => (mid - a * k).toFixed(2);

    d += ` H${at(0.28)}`;          // isoelectric baseline
    d += ` L${at(0.34)} ${y(0.16)}`; // P
    d += ` L${at(0.4)} ${y(0)}`;
    d += ` L${at(0.45)} ${y(-0.2)}`; // Q
    d += ` L${at(0.5)} ${y(1)}`;     // R
    d += ` L${at(0.55)} ${y(-0.4)}`; // S
    d += ` L${at(0.6)} ${y(0)}`;
    d += ` L${at(0.7)} ${y(0.24)}`;  // T
    d += ` L${at(0.78)} ${y(0)}`;
    d += ` H${at(1)}`;
  }
  return d;
}

const SIZE: Record<TraceVariant, { w: number; h: number; stroke: number }> = {
  instrument: { w: 1200, h: 160, stroke: 2.5 },
  rule: { w: 1200, h: 40, stroke: 1.5 },
  spark: { w: 240, h: 32, stroke: 2 },
};

interface VitalTraceProps {
  state?: AgentState;
  variant?: TraceVariant;
  /** Runs the lit sweep. Off for static contexts like a section rule. */
  live?: boolean;
  className?: string;
  /** Announced to screen readers; omit for purely ornamental placements. */
  label?: string;
}

export function VitalTrace({
  state = "thriving",
  variant = "rule",
  live = true,
  className = "",
  label,
}: VitalTraceProps) {
  // useId returns ids wrapped in colons (":r0:"), which are legal in an
  // id attribute but break url(#…) references in some engines.
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const { w, h, stroke } = SIZE[variant];
  const { beats, amp } = PULSE[state];
  const colour = STROKE[state];

  const d = useMemo(() => tracePath(w, h, beats, amp), [w, h, beats, amp]);

  // The rule fades to nothing at both ends so it reads as a signal
  // passing through the page rather than a line that starts and stops.
  const maskId = `trace-fade-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={maskId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.12" stopColor="#fff" />
          <stop offset="0.88" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`m-${uid}`}>
          <rect width={w} height={h} fill={`url(#${maskId})`} />
        </mask>
      </defs>

      <g mask={variant === "rule" ? `url(#m-${uid})` : undefined}>
        {/* The trace at rest. Always present, so the instrument still
            reads as an instrument when motion is switched off. */}
        <path
          d={d}
          fill="none"
          stroke={colour}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.22}
          vectorEffect="non-scaling-stroke"
        />

        {/* The sweep: a short lit segment travelling the length of the
            path, the way a cursor crosses a cardiac monitor. */}
        {live && (
          <path
            className="animate-trace-sweep"
            style={{ ["--trace-len" as string]: "1000" }}
            d={d}
            fill="none"
            stroke={colour}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1000}
            strokeDasharray="120 880"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </g>
    </svg>
  );
}

/**
 * The rule between sections. It carries the state of the page at that
 * point in the argument: the problem section flatlines, the loop revives,
 * everything after it holds.
 */
export function TraceRule({
  state = "thriving",
  live = false,
}: {
  state?: AgentState;
  live?: boolean;
}) {
  return (
    <div className="relative h-10 w-full overflow-hidden" aria-hidden>
      <VitalTrace variant="rule" state={state} live={live} className="h-10 w-full" />
    </div>
  );
}

export default VitalTrace;
