import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Coins,
  Gift,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  Send,
  Server,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAdminAirdrop,
  useAdminProtocolSettings,
  useAdminStats,
  useToggleProtocolSetting,
} from "@/features/api/hooks";
import { PageTitle, Panel, PanelHeader, Stat } from "@/components/dashboard/primitives";
import { BRAND } from "@/lib/brand";

const STORAGE_KEY = "monkii_admin_master_key";

export default function AdminPage() {
  const { t } = useTranslation();
  const [adminKey, setAdminKey] = useState<string>(() => sessionStorage.getItem(STORAGE_KEY) || "");
  const [keyInput, setKeyInput] = useState("");

  const stats = useAdminStats(adminKey);
  const protocolSettings = useAdminProtocolSettings(adminKey);
  const toggleSetting = useToggleProtocolSetting(adminKey);
  const airdrop = useAdminAirdrop(adminKey);

  // Airdrop form state
  const [recipient, setRecipient] = useState("");
  const [monkiAmount, setMonkiAmount] = useState("");
  const [ponsAmount, setPonsAmount] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      toast.error(t("admin.needKey"));
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, keyInput.trim());
    setAdminKey(keyInput.trim());
    toast.success(t("admin.signedIn"));
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAdminKey("");
    toast.info(t("admin.loggedOut"));
  };

  const handleAirdropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim().startsWith("0x")) {
      toast.error(t("admin.needAddress"));
      return;
    }
    const monki = Number(monkiAmount) || 0;
    const pons = Number(ponsAmount) || 0;
    if (monki <= 0 && pons <= 0) {
      toast.error(t("admin.needAmount"));
      return;
    }

    airdrop.mutate(
      {
        recipientAddress: recipient.trim(),
        amountMonki: monki,
        amountPons: pons,
      },
      {
        onSuccess: () => {
          setRecipient("");
          setMonkiAmount("");
          setPonsAmount("");
        },
      },
    );
  };

  if (!adminKey) {
    return (
      <div className="mx-auto max-w-md py-12">
        <Panel raised>
          <PanelHeader
            title={t("admin.gateTitle")}
            hint={t("admin.gateHint")}
          />
          <form onSubmit={handleLogin} className="space-y-4 p-6">
            <div>
              <label className="block font-mono text-xs font-semibold uppercase text-paper-2">
                Master Admin Key
              </label>
              <div className="relative mt-1.5">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-3" />
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder={t("admin.gatePlaceholder")}
                  className="w-full rounded-xl border border-hair/15 bg-bench py-2.5 pl-10 pr-4 font-mono text-sm text-paper focus:border-alive-lit focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-act py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-playful hover:bg-act-lit active:scale-[0.98]"
            >
              Authenticate Session
            </button>
          </form>
        </Panel>
      </div>
    );
  }

  const s = stats.data;
  const ps = protocolSettings.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle
          title={t("admin.title")}
          intro={t("admin.intro")}
        />
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-xl border border-hair/10 bg-hair/5 px-3 py-2 font-mono text-xs font-bold uppercase text-paper hover:bg-hair/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          End Admin Session
        </button>
      </div>

      {/* Protocol Telemetry Metrics */}
      <Panel raised>
        <PanelHeader
          title={t("admin.metricsTitle")}
          hint={t("admin.metricsHint")}
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat value={s ? s.totalUsers.toLocaleString() : "—"} label={t("admin.totalUsers")} />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat value={s ? s.totalAgents.toLocaleString() : "—"} label={t("admin.totalAgents")} />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat
              value={s ? s.activeSessions.toLocaleString() : "—"}
              label={t("admin.activeSessions")}
              tone="vital"
            />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat
              value={s ? s.totalClaimableMonki.toLocaleString() : "—"}
              label={t("admin.accruedMonki")}
            />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat
              value={s ? s.totalClaimablePons.toFixed(2) : "—"}
              label={t("admin.claimablePons")}
              tone="coral"
            />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat
              value={s ? s.totalCompanionsMinted.toLocaleString() : "—"}
              label={t("admin.companionsMinted")}
              tone="vital"
            />
          </div>
        </div>
      </Panel>

      {/* Protocol Claim & Feature Controls */}
      <Panel>
        <PanelHeader
          title={t("admin.controlsTitle")}
          hint={t("admin.controlsHint")}
        />
        <div className="divide-y divide-hair/10 p-5">
          {/* $MONKI Mining Claiming Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-paper">{t("admin.monkiHeading")}</h3>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                    ps?.enableMonkiClaiming
                      ? "border-alive/30 bg-alive/10 text-alive-lit"
                      : "border-idle/30 bg-idle/10 text-idle"
                  }`}
                >
                  {ps?.enableMonkiClaiming ? t("admin.monkiActive") : t("admin.monkiGated")}
                </span>
              </div>
              <p className="mt-1 text-xs text-paper-3 max-w-xl">
                {t("admin.monkiNote")}
              </p>
            </div>

            <button
              type="button"
              disabled={toggleSetting.isPending}
              onClick={() => toggleSetting.mutate("monki")}
              className={`rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                ps?.enableMonkiClaiming
                  ? "border border-coral/30 bg-coral/10 text-coral hover:bg-coral/20"
                  : "bg-alive-lit text-black hover:opacity-90"
              }`}
            >
              {ps?.enableMonkiClaiming ? t("admin.monkiPause") : t("admin.monkiUnlock")}
            </button>
          </div>

          {/* $PONS Staking Payouts Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-paper">{t("admin.ponsHeading")}</h3>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                    ps?.enablePonsClaiming
                      ? "border-alive/30 bg-alive/10 text-alive-lit"
                      : "border-coral/30 bg-coral/10 text-coral"
                  }`}
                >
                  {ps?.enablePonsClaiming ? t("admin.active") : t("admin.paused")}
                </span>
              </div>
              <p className="mt-1 text-xs text-paper-3 max-w-xl">
                {t("admin.ponsNote")}
              </p>
            </div>

            <button
              type="button"
              disabled={toggleSetting.isPending}
              onClick={() => toggleSetting.mutate("pons")}
              className={`rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                ps?.enablePonsClaiming
                  ? "border border-coral/30 bg-coral/10 text-coral hover:bg-coral/20"
                  : "bg-act text-white hover:bg-act-lit"
              }`}
            >
              {ps?.enablePonsClaiming ? t("admin.ponsPause") : t("admin.ponsEnable")}
            </button>
          </div>

          {/* Companion NFT Minting Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 last:pb-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-paper">{t("admin.mintHeading")}</h3>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                    ps?.enableCompanionMinting
                      ? "border-alive/30 bg-alive/10 text-alive-lit"
                      : "border-coral/30 bg-coral/10 text-coral"
                  }`}
                >
                  {ps?.enableCompanionMinting ? t("admin.active") : t("admin.paused")}
                </span>
              </div>
              <p className="mt-1 text-xs text-paper-3 max-w-xl">
                {t("admin.mintNote")}
              </p>
            </div>

            <button
              type="button"
              disabled={toggleSetting.isPending}
              onClick={() => toggleSetting.mutate("companion")}
              className={`rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                ps?.enableCompanionMinting
                  ? "border border-coral/30 bg-coral/10 text-coral hover:bg-coral/20"
                  : "bg-act text-white hover:bg-act-lit"
              }`}
            >
              {ps?.enableCompanionMinting ? t("admin.mintPause") : t("admin.mintEnable")}
            </button>
          </div>
        </div>
      </Panel>

      {/* Manual Airdrop & Credit Tool */}
      <Panel>
        <PanelHeader
          title={t("admin.airdropTitle")}
          hint={t("admin.airdropHint")}
        />
        <form onSubmit={handleAirdropSubmit} className="space-y-4 p-5">
          <div>
            <label className="block font-mono text-xs font-semibold uppercase text-paper-2">
              Recipient Robinhood Chain / EVM Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x…"
              className="mt-1.5 w-full rounded-xl border border-hair/15 bg-bench p-2.5 font-mono text-xs text-paper focus:border-alive-lit focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-semibold uppercase text-paper-2">
                Amount $MONKI
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={monkiAmount}
                onChange={(e) => setMonkiAmount(e.target.value)}
                placeholder="0.0"
                className="mt-1.5 w-full rounded-xl border border-hair/15 bg-bench p-2.5 font-mono text-xs text-paper focus:border-alive-lit focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-xs font-semibold uppercase text-paper-2">
                Amount $PONS
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={ponsAmount}
                onChange={(e) => setPonsAmount(e.target.value)}
                placeholder="0.0"
                className="mt-1.5 w-full rounded-xl border border-hair/15 bg-bench p-2.5 font-mono text-xs text-paper focus:border-alive-lit focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={airdrop.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-act px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-act-lit disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {airdrop.isPending ? t("admin.crediting") : t("admin.execute")}
          </button>
        </form>
      </Panel>
    </div>
  );
}
