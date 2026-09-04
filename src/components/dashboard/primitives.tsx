import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, KeyRound, Loader2, Sparkles, Wallet } from "lucide-react";

import { useWallet } from "@/hooks/useWallet";
import type { AgentState } from "@/features/api/types";

/* =====================================================================
   Cockpit primitives — Modern Robinhood Chain Laboratory Design.
   Precision instrumentation, crisp 1px borders, subtle telemetry glows,
   and clean typography replacing chunky comic-book outlines.
   ===================================================================== */

export function Panel({
  children,
  className = "",
  raised = false,
}: {
  children: ReactNode;
  className?: string;
  raised?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border bg-[#111713]/90 text-slate-100 backdrop-blur-md transition-all duration-200 ${
        raised
          ? "border-emerald-500/25 shadow-xl shadow-black/40 ring-1 ring-emerald-500/10"
          : "border-white/10 shadow-lg shadow-black/25 hover:border-white/15"
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  action,
  hint,
}: {
  title: string;
  action?: ReactNode;
  hint?: string;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
          {title}
        </h2>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      {action}
    </header>
  );
}

export function PageTitle({
  index,
  eyebrow,
  title,
  intro,
  action,
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {(index || eyebrow) && (
        <div className="flex items-center gap-2 text-xs">
          {index && (
            <span className="font-mono font-bold uppercase tracking-wider text-emerald-400">
              [{index}]
            </span>
          )}
          <span className="h-px w-6 bg-emerald-500/30" aria-hidden />
          {eyebrow && (
            <span className="font-mono font-medium uppercase tracking-wider text-slate-400">
              {eyebrow}
            </span>
          )}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {intro && <p className="mt-1.5 max-w-[64ch] text-sm text-slate-400">{intro}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

/** Value over label — precision instrument counter */
export function Stat({
  value,
  label,
  tone = "default",
  sub,
}: {
  value: ReactNode;
  label: string;
  tone?: "default" | "vital" | "coral" | "amber";
  sub?: string;
}) {
  const color =
    tone === "vital"
      ? "text-emerald-400"
      : tone === "coral"
      ? "text-rose-400"
      : tone === "amber"
      ? "text-amber-400"
      : "text-white";

  return (
    <div className="min-w-0">
      <div className={`font-display text-xl font-bold tracking-tight tabular-nums sm:text-2xl ${color}`}>
        {value}
      </div>
      <div className="mt-1 font-mono text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

/* ---- Vitality States --------------------------------------------------- */

export const STATE_META: Record<
  AgentState,
  { label: string; text: string; bg: string; border: string; dot: string; bar: string }
> = {
  thriving: {
    label: "Thriving",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    bar: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  },
  idle: {
    label: "Idle",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
  },
  fading: {
    label: "Fading",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    dot: "bg-rose-400 animate-ping",
    bar: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
  },
};

export function StateChip({ state }: { state: AgentState }) {
  const meta = STATE_META[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${meta.bg} ${meta.border} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}

/**
 * Modern Segmented Power Meter — inspired by high-end telemetry gauges.
 * Discrete blocks, first block is red (the death floor), warning notch, glowing fill.
 */
export function PowerMeter({
  power,
  max,
  state,
  segments = 14,
  showValue = true,
}: {
  power: number;
  max: number;
  state: AgentState;
  segments?: number;
  showValue?: boolean;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(1, power / max)) : 0;
  const filled = Math.round(pct * segments);
  const meta = STATE_META[state];

  return (
    <div>
      <div
        className="flex gap-1 overflow-hidden rounded-lg border border-white/10 bg-[#090d0a] p-1 shadow-inner"
        role="meter"
        aria-valuenow={Math.round(pct * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Agent vitality"
      >
        {Array.from({ length: segments }).map((_, i) => {
          const isFloor = i === 0;
          const isFilled = i < filled;
          return (
            <span
              key={i}
              className={`h-2.5 flex-1 rounded-[2px] transition-all duration-300 ${
                isFloor
                  ? "bg-rose-500/90 shadow-[0_0_6px_rgba(244,63,94,0.5)]"
                  : isFilled
                  ? meta.bar
                  : "bg-white/[0.04]"
              }`}
            />
          );
        })}
      </div>
      {showValue && (
        <div className="mt-1.5 flex items-baseline justify-between text-xs">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
            Vitality
          </span>
          <span className={`font-mono text-xs font-semibold tabular-nums ${meta.text}`}>
            {Math.round(power).toLocaleString()} / {Math.round(max).toLocaleString()} pw
          </span>
        </div>
      )}
    </div>
  );
}

/* ---- Status Panels ------------------------------------------------------ */

export function LoadingPanel({ label = "Loading telemetry" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#111713]/60 p-8 text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
      <span className="font-mono text-xs uppercase tracking-wider">{label}…</span>
    </div>
  );
}

export function ErrorPanel({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = (error as Error)?.message ?? "An unexpected error occurred.";
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
        <div className="min-w-0">
          <p className="font-semibold text-white">Telemetry read failed</p>
          <p className="mt-1 break-words text-xs text-rose-300/80">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-xl border border-rose-400/40 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-500/30"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyPanel({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
      <Sparkles className="mx-auto h-6 w-6 text-slate-500" />
      <p className="mt-2 text-sm font-semibold text-slate-200">{title}</p>
      <p className="mx-auto mt-1 max-w-[42ch] text-xs text-slate-400">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Wraps actions requiring authentication on Robinhood Chain.
 */
export function AuthGate({ children, what }: { children: ReactNode; what: string }) {
  const { isConnected, isAuthenticated, isAuthenticating, signIn, setShowConnectModal, authError } =
    useWallet();

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-[#111713]/90 p-8 text-center shadow-xl backdrop-blur-md">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
        <Wallet className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-lg font-bold text-white">
        {isConnected ? "Sign in to Monkii Labs" : "Connect Robinhood Chain Wallet"}
      </h3>
      <p className="mx-auto mt-1.5 max-w-[44ch] text-xs text-slate-400">
        {isConnected
          ? `Sign a gasless message with your connected wallet to access ${what}. Proves ownership with zero gas.`
          : `Connect your EVM wallet on Robinhood Chain to interact with ${what}.`}
      </p>
      {authError && <p className="mt-2 text-xs text-rose-400">{authError}</p>}
      <button
        type="button"
        disabled={isAuthenticating}
        onClick={() => (isConnected ? void signIn() : setShowConnectModal(true))}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-900/30 active:scale-95 disabled:opacity-50"
      >
        {isAuthenticating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isConnected ? (
          <KeyRound className="h-4 w-4" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {isConnected ? "Sign In (Gasless)" : "Connect Wallet"}
      </button>
    </div>
  );
}

export function InlineLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-xs font-semibold text-emerald-400 underline-offset-4 transition-colors hover:text-emerald-300 hover:underline"
    >
      {children}
    </Link>
  );
}

/* ---- Formatting -------------------------------------------------------- */

export function fmt(n: number | null | undefined, digits = 0): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function timeUntil(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return "—";
  if (ms <= 0) return "now";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
