import { Check, Copy, Heart, Send, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import { useDashboardSummary, useProfile, useTelegramLinkCode } from "@/features/api/hooks";
import {
  AuthGate,
  EmptyPanel,
  LoadingPanel,
  Panel,
  PanelHeader,
  PageTitle,
  StateChip,
  timeAgo,
} from "@/components/dashboard/primitives";
import { BRAND, monkiiMark } from "@/lib/brand";

const BOT_HANDLE = "MonkiiLabsBot";

const AlertsInner = () => {
  const profile = useProfile();
  const summary = useDashboardSummary();
  const linkCode = useTelegramLinkCode();
  const [copied, setCopied] = useState(false);

  const code = linkCode.data?.linkCode ?? profile.data?.telegram.linkCode ?? null;
  const linked = profile.data?.telegram.linked ?? false;

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(`/start ${code}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast.success("Command copied to clipboard");
    } catch {
      toast.error("Could not copy. Highlight the text and copy it manually.");
    }
  };

  // Agents at risk of fading
  const atRisk = (summary.data?.nurturedAgents ?? []).filter((a) => a.state !== "thriving");

  return (
    <div className="space-y-5">
      {/* Telegram Sentinel Integration */}
      <Panel raised>
        <PanelHeader
          title="Vitality Sentinel Bot (@MonkiiLabsBot)"
          hint={`Receive immediate real-time push alerts via Telegram the second any of your nurtured agents slip into idle or fading.`}
        />
        <div className="p-5">
          {linked ? (
            <div className="flex items-center gap-3 rounded-xl border border-alive/30 bg-alive/10 p-4">
              <Check className="h-5 w-5 shrink-0 text-alive-lit" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-paper">Telegram Sentinel Active</p>
                <p className="text-xs text-paper-3">
                  {profile.data?.telegram.username
                    ? `Telemetry drop alerts configured for @${profile.data.telegram.username}.`
                    : "Power-drop warnings are active."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <ol className="space-y-2 text-xs text-paper-3">
                <li>
                  <strong className="text-paper">1.</strong> Request a one-time cryptographic pairing code below.
                </li>
                <li>
                  <strong className="text-paper">2.</strong> Open{" "}
                  <a
                    href={`https://t.me/${BOT_HANDLE}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-bold text-alive-lit hover:underline"
                  >
                    @{BOT_HANDLE}
                  </a>{" "}
                  in Telegram.
                </li>
                <li>
                  <strong className="text-paper">3.</strong> Send:{" "}
                  <code className="rounded border border-hair/15 bg-black/40 px-2 py-0.5 font-mono text-alive-lit">
                    /start {code ?? "YOUR_CODE"}
                  </code>
                </li>
              </ol>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={linkCode.isPending}
                  onClick={() => linkCode.mutate()}
                  className="inline-flex items-center gap-2 rounded-xl bg-act px-4 py-2 font-mono text-micro font-semibold uppercase text-paper transition-colors hover:bg-act-lit active:scale-[0.97] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {code ? "Regenerate Code" : "Get Pairing Code"}
                </button>

                {code && (
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex items-center gap-2 rounded-xl border border-hair/10 bg-hair/[0.05] px-4 py-2 font-mono text-xs font-bold text-paper transition-colors hover:bg-hair/10"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-alive-lit" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-paper-3" />
                    )}
                    <span>/start {code}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Panel>

      {/* Agents Needing Immediate Attention */}
      <Panel>
        <PanelHeader
          title="Agents Requiring Compute Support"
          hint="Agents in idle or fading states suffering from power decay."
        />
        <div className="p-5">
          {summary.isLoading ? (
            <LoadingPanel label="Scanning agent power telemetry" />
          ) : atRisk.length === 0 ? (
            <EmptyPanel
              title="All monitored agents are thriving"
              body="None of your agents have dipped below the healthy vitality threshold."
            />
          ) : (
            <ul className="space-y-2.5">
              {atRisk.map((agent) => (
                <li
                  key={agent.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-hair/10 bg-hair/[0.05] p-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={agent.avatarUrl ?? monkiiMark}
                      alt=""
                      className="h-10 w-10 rounded-lg border border-hair/10 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-paper">{agent.name}</p>
                      <p className="font-mono text-[11px] text-paper-3">
                        Current Power: {Math.round(agent.power)} pw
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StateChip state={agent.state} />
                    <Link
                      to={`/dashboard/agents/${agent.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-act px-3 py-1.5 font-mono text-micro font-semibold uppercase text-paper transition-colors hover:bg-act-lit"
                    >
                      <Heart className="h-3 w-3" />
                      Revive
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>
    </div>
  );
};

const AlertsPage = () => (
  <>
    <PageTitle
      index="05"
      eyebrow="Sentinel Telemetry"
      title="Vitality Alerts & Telegram Sentinel"
      intro="Connect @MonkiiLabsBot for instant automated notifications whenever your nurtured fleet agents slip into idle or fading states."
    />
    <AuthGate what="your alert feeds and Telegram pairing">
      <AlertsInner />
    </AuthGate>
  </>
);

export default AlertsPage;
