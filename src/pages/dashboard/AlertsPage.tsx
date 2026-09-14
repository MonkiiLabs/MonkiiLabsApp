import { Check, Copy, Heart, Send, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
import { monkiiMark } from "@/lib/brand";

const BOT_HANDLE = "MonkiiLabsBot";

const AlertsInner = () => {
  const { t } = useTranslation();
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
      toast.success(t("alerts.copied"));
    } catch {
      toast.error(t("alerts.copyFailed"));
    }
  };

  // Agents at risk of fading
  const atRisk = (summary.data?.nurturedAgents ?? []).filter((a) => a.state !== "thriving");

  return (
    <div className="space-y-5">
      {/* Telegram Sentinel Integration */}
      <Panel raised>
        <PanelHeader
          title={t("alerts.botTitle", { bot: BOT_HANDLE })}
          hint={t("alerts.botHint")}
        />
        <div className="p-5">
          {linked ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-alive/30 bg-alive/10 p-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-alive-lit" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-paper">{t("alerts.activeTitle")}</p>
                    <p className="text-xs text-paper-3">
                      {profile.data?.telegram.username
                        ? t("alerts.activeFor", { username: profile.data.telegram.username })
                        : t("alerts.activeGeneric")}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://t.me/${BOT_HANDLE}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-alive/40 bg-alive/20 px-3 py-1.5 font-mono text-[11px] font-bold text-alive-lit transition-colors hover:bg-alive/30"
                >
                  <Send className="h-3 w-3" />
                  Open @{BOT_HANDLE}
                </a>
              </div>

              <div className="rounded-xl border border-hair/10 bg-bench/50 p-3.5 text-xs text-paper-2">
                <p className="font-semibold text-paper">🤖 Interactive Sentinel Commands</p>
                <p className="mt-1 text-paper-3">
                  Message the bot directly or use the persistent keyboard on Telegram to query your telemetry:
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <span className="rounded border border-hair/10 bg-cream px-2 py-1 font-mono text-[11px] text-alive-lit">
                    /stats — Overview & Rank
                  </span>
                  <span className="rounded border border-hair/10 bg-cream px-2 py-1 font-mono text-[11px] text-alive-lit">
                    /monki — Mined $MONKI
                  </span>
                  <span className="rounded border border-hair/10 bg-cream px-2 py-1 font-mono text-[11px] text-alive-lit">
                    /pons — $PONS Staking Yield
                  </span>
                  <span className="rounded border border-hair/10 bg-cream px-2 py-1 font-mono text-[11px] text-alive-lit">
                    /agents — Fleet Vitality
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ol className="space-y-2 text-xs text-paper-3">
                <li>
                  <strong className="text-paper">1.</strong> {t("alerts.step1")}
                </li>
                <li>
                  <strong className="text-paper">2.</strong> {t("alerts.step2a")}{" "}
                  <a
                    href={`https://t.me/${BOT_HANDLE}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-bold text-alive-lit hover:underline"
                  >
                    @{BOT_HANDLE}
                  </a>{" "}
                  {t("alerts.step2b")}
                </li>
                <li>
                  <strong className="text-paper">3.</strong> {t("alerts.step3")}{" "}
                  <code className="rounded border border-hair/15 bg-cream px-2 py-0.5 font-mono text-alive-lit">
                    /start {code ?? "YOUR_CODE"}
                  </code>
                </li>
              </ol>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={linkCode.isPending}
                  onClick={() => linkCode.mutate()}
                  className="inline-flex items-center gap-2 rounded-xl bg-act px-4 py-2 font-mono text-micro font-semibold uppercase text-white transition-colors hover:bg-act-lit active:scale-[0.97] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {code ? t("alerts.regenerate") : t("alerts.getCode")}
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
          title={t("alerts.riskTitle")}
          hint={t("alerts.riskHint")}
        />
        <div className="p-5">
          {summary.isLoading ? (
            <LoadingPanel label={t("alerts.scanning")} />
          ) : atRisk.length === 0 ? (
            <EmptyPanel
              title={t("alerts.allThrivingTitle")}
              body={t("alerts.allThrivingBody")}
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
                        {t("alerts.currentPower", { value: Math.round(agent.power) })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StateChip state={agent.state} />
                    <Link
                      to={`/dashboard/agents/${agent.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-act px-3 py-1.5 font-mono text-micro font-semibold uppercase text-white transition-colors hover:bg-act-lit"
                    >
                      <Heart className="h-3 w-3" />
                      {t("alerts.revive")}
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

const AlertsPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("alerts.title")} intro={t("alerts.intro", { bot: BOT_HANDLE })} />
      <AuthGate what={t("alerts.authWhat")}>
        <AlertsInner />
      </AuthGate>
    </>
  );
};

export default AlertsPage;
