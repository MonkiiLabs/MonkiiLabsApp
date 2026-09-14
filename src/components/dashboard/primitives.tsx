import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import i18n from "@/i18n";
import { AlertTriangle, KeyRound, Loader2, Sparkles, Wallet } from "lucide-react";

import { useWallet } from "@/hooks/useWallet";
import { walletConnectEnabled } from "@/lib/wagmi";
import type { AgentState } from "@/features/api/types";

/* =====================================================================
   Cockpit primitives.

   Same rule as the rest of the product, and it is the whole reason the
   dashboard stopped reading as a wall of green: colour is either a
   reading or a command, never both.

     green   thriving, live telemetry, a meter that is filling
     amber   idle
     red     fading: and, separately, the one button you are meant to
             press. The two never collide, because an alarm is a tinted
             chip on a hairline and an action is a solid fill.
     brass   anything denominated
     paper   everything else

   Depth is a hairline plus a lightness step. No drop shadows: on a
   ground this dark they read as smudges.
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
      className={`rounded-xl border transition-colors duration-200 ${
        raised
          ? "border-hair/16 bg-bench-3"
          : "border-hair/9 bg-bench-2 hover:border-hair/16"
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
    <header className="flex flex-wrap items-center justify-between gap-fib2 border-b border-hair/8 px-fib3 py-fib2">
      <div className="min-w-0">
        <h2 className="label-mono text-paper-2">{title}</h2>
        {hint && <p className="mt-1 text-label text-paper-3">{hint}</p>}
      </div>
      {action}
    </header>
  );
}

export function PageTitle({
  title,
  intro,
  action,
}: {
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-d1 font-extrabold text-paper sm:text-d2">{title}</h1>
          {intro && <p className="mt-fib1 max-w-[64ch] text-label text-paper-2">{intro}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

/** Value over label, precision instrument counter */
export function Stat({
  value,
  label,
  tone = "default",
  sub,
}: {
  value: ReactNode;
  label: string;
  tone?: "default" | "vital" | "coral" | "amber" | "brass";
  sub?: string;
}) {
  const color =
    tone === "vital"
      ? "text-alive-lit"
      : tone === "coral"
      ? "text-act-lit"
      : tone === "amber"
      ? "text-idle"
      : tone === "brass"
      ? "text-brass"
      : "text-paper";

  return (
    <div className="min-w-0">
      <div className={`font-display text-d1 tabular-nums sm:text-d2 ${color}`}>{value}</div>
      <div className="label-mono mt-fib1 text-paper-3">{label}</div>
      {sub && <div className="mt-0.5 text-label text-paper-3">{sub}</div>}
    </div>
  );
}

/* ---- Vitality States --------------------------------------------------- */

export const STATE_META: Record<
  AgentState,
  { labelKey: string; text: string; bg: string; border: string; dot: string; bar: string }
> = {
  thriving: {
    labelKey: "prim.state.thriving",
    text: "text-alive-lit",
    bg: "bg-alive/10",
    border: "border-alive/30",
    dot: "bg-alive",
    bar: "bg-alive",
  },
  idle: {
    labelKey: "prim.state.idle",
    text: "text-idle",
    bg: "bg-idle/10",
    border: "border-idle/28",
    dot: "bg-idle",
    bar: "bg-idle",
  },
  fading: {
    labelKey: "prim.state.fading",
    text: "text-act-lit",
    bg: "bg-act/10",
    border: "border-act/32",
    // A fading agent is an alarm, so its indicator breathes rather than
    // pinging: a ping reads as a notification you can dismiss.
    dot: "bg-act-lit animate-breathe",
    bar: "bg-act",
  },
};

export function StateChip({ state }: { state: AgentState }) {
  const { t } = useTranslation();
  const meta = STATE_META[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-fib2 py-0.5 font-mono text-micro font-semibold uppercase ${meta.bg} ${meta.border} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {t(meta.labelKey)}
    </span>
  );
}

/**
 * The segmented power meter. Discrete blocks rather than a continuous
 * bar, because vitality is evaluated on a one-minute tick, a smooth
 * fill would imply a precision the number does not have.
 *
 * The first block is always red: it is the death floor, and it stays
 * visible at full health so you can see how far there is to fall.
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
  const { t } = useTranslation();
  const pct = max > 0 ? Math.max(0, Math.min(1, power / max)) : 0;
  const filled = Math.round(pct * segments);
  const meta = STATE_META[state];

  return (
    <div>
      <div
        className="well flex gap-1 overflow-hidden p-1"
        role="meter"
        aria-valuenow={Math.round(pct * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("prim.agentVitality")}
      >
        {Array.from({ length: segments }).map((_, i) => {
          const isFloor = i === 0;
          const isFilled = i < filled;
          return (
            <span
              key={i}
              className={`h-2.5 flex-1 rounded-[2px] transition-all duration-300 ${
                isFloor ? "bg-act" : isFilled ? meta.bar : "bg-hair/[0.06]"
              }`}
            />
          );
        })}
      </div>
      {showValue && (
        <div className="mt-1.5 flex items-baseline justify-between text-xs">
          <span className="label-mono text-paper-3">{t("prim.vitality")}</span>
          <span className={`font-mono text-label font-semibold tabular-nums ${meta.text}`}>
            {Math.round(power).toLocaleString()} / {Math.round(max).toLocaleString()} {t("prim.pw")}
          </span>
        </div>
      )}
    </div>
  );
}

/* ---- Status Panels ------------------------------------------------------ */

export function LoadingPanel({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-fib2 rounded-xl border border-hair/9 bg-bench-2 p-fib5 text-paper-3">
      <Loader2 className="h-4 w-4 animate-spin text-paper-3" />
      <span className="label-mono">{label ?? t("prim.loading")}…</span>
    </div>
  );
}

export function ErrorPanel({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const message = (error as Error)?.message ?? t("prim.unexpectedError");
  return (
    <div className="rounded-xl border border-act/30 bg-act/[0.07] p-fib3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-act-lit" />
        <div className="min-w-0">
          <p className="font-semibold text-paper">{t("prim.readFailed")}</p>
          <p className="mt-1 break-words text-label text-paper-2">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="act mt-fib2 inline-flex h-9 items-center px-fib3 text-label font-semibold"
            >
              {t("prim.retry")}
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
    <div className="rounded-xl border border-dashed border-hair/14 bg-hair/[0.02] p-fib5 text-center">
      <Sparkles className="mx-auto h-5 w-5 text-paper-4" strokeWidth={1.5} />
      <p className="mt-fib2 font-semibold text-paper">{title}</p>
      <p className="mx-auto mt-1 max-w-[42ch] text-label text-paper-3">{body}</p>
      {action && <div className="mt-fib3">{action}</div>}
    </div>
  );
}

/**
 * Wraps actions requiring authentication on Robinhood Chain.
 */
export function AuthGate({ children, what }: { children: ReactNode; what: string }) {
  const { t } = useTranslation();
  const {
    isConnected,
    isAuthenticated,
    isAuthenticating,
    connectAndSignIn,
    switchWallet,
    formatAddress,
    address,
    authError,
  } = useWallet();

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="rounded-xl border border-hair/10 bg-bench-2 p-fib5 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-md border border-hair/12 bg-hair/[0.05] text-paper-2">
        <Wallet className="h-5 w-5" />
      </span>
      <h3 className="mt-fib2 font-display text-d1 text-paper">{t("wallet.openSession")}</h3>
      <p className="mx-auto mt-fib2 max-w-[46ch] text-label text-paper-2">
        {isConnected ? t("wallet.signPrompt", { what }) : t("wallet.pickPrompt", { what })}
      </p>
      {!walletConnectEnabled && !isConnected && (
        <p className="mx-auto mt-fib2 max-w-[46ch] text-label text-paper-3">
          {t("wallet.noMobileWallets")}
        </p>
      )}
      {authError && <p className="mt-fib2 text-label text-act-lit">{authError}</p>}

      {/* One action, one name, all the way through the flow. Clicking it
          opens RainbowKit's wallet picker when nothing is connected, and
          signs on its own as soon as a wallet lands. */}
      <button
        type="button"
        disabled={isAuthenticating}
        onClick={connectAndSignIn}
        className="act mt-fib3 inline-flex h-10 items-center gap-2 px-fib4 text-label font-semibold"
      >
        {isAuthenticating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="h-4 w-4" />
        )}
        {t("wallet.openSessionButton")}
      </button>

      {isConnected && address && (
        <p className="mt-fib3 text-label text-paper-3">
          {t("wallet.signingAs")} <span className="font-mono tabular-nums">{formatAddress(address)}</span>.{" "}
          <button
            type="button"
            onClick={switchWallet}
            className="font-semibold text-paper-2 underline underline-offset-4 hover:text-paper"
          >
            {t("wallet.useDifferent")}
          </button>
        </p>
      )}
    </div>
  );
}

export function InlineLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-label font-semibold text-act-lit underline-offset-4 transition-colors hover:underline"
    >
      {children}
    </Link>
  );
}

/* ---- Formatting -------------------------------------------------------- */

export function fmt(n: number | null | undefined, digits = 0): string {
  if (n == null || Number.isNaN(n)) return "-";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function timeUntil(iso: string | null | undefined): string {
  if (!iso) return "-";
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return "-";
  if (ms <= 0) return i18n.t("prim.time.now");
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 24) return i18n.t("prim.time.dh", { d: Math.floor(h / 24), h: h % 24 });
  return h > 0 ? i18n.t("prim.time.hm", { h, m }) : i18n.t("prim.time.m", { m });
}

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const m = Math.floor(ms / 60_000);
  if (m < 1) return i18n.t("prim.time.justNow");
  if (m < 60) return i18n.t("prim.time.mAgo", { m });
  const h = Math.floor(m / 60);
  if (h < 24) return i18n.t("prim.time.hAgo", { h });
  return i18n.t("prim.time.dAgo", { d: Math.floor(h / 24) });
}
