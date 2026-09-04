import { useState, useEffect } from "react";
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
      toast.error("Enter master admin key");
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, keyInput.trim());
    setAdminKey(keyInput.trim());
    toast.success("Signed in as Admin");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAdminKey("");
    toast.info("Logged out of admin panel");
  };

  const handleAirdropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim().startsWith("0x")) {
      toast.error("Valid EVM 0x wallet address required");
      return;
    }
    const monki = Number(monkiAmount) || 0;
    const pons = Number(ponsAmount) || 0;
    if (monki <= 0 && pons <= 0) {
      toast.error("Enter at least one token amount");
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
            title="Monkii Labs Command & Control"
            hint="Enter MASTER_ADMIN_KEY to access protocol governance."
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
                  placeholder="Enter administrative authorization key…"
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
          title="Protocol Administration"
          intro="Global launch gating, claim switches, on-chain disbursement controls, and telemetry."
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
          title="Laboratory System Metrics"
          hint="Aggregated real-time platform telemetry across database and smart contracts."
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat value={s ? s.totalUsers.toLocaleString() : "—"} label="Total Registered Nurturers" />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat value={s ? s.totalAgents.toLocaleString() : "—"} label="Monitored Fleet Agents" />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat
              value={s ? s.activeSessions.toLocaleString() : "—"}
              label="Active Proof-of-Life Sessions"
              tone="alive"
            />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat
              value={s ? s.totalClaimableMonki.toLocaleString() : "—"}
              label="Accrued Pre-TGE $MONKI"
            />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat
              value={s ? s.totalClaimablePons.toFixed(2) : "—"}
              label="Claimable $PONS Pool Yield"
              tone="coral"
            />
          </div>
          <div className="rounded-xl border border-hair/10 bg-hair/[0.04] p-4">
            <Stat
              value={s ? s.totalCompanionsMinted.toLocaleString() : "—"}
              label="Companions Minted / Unlocked"
              tone="alive"
            />
          </div>
        </div>
      </Panel>

      {/* Protocol Claim & Feature Controls */}
      <Panel>
        <PanelHeader
          title="Protocol Claim Controls & Launch Gating"
          hint="Control on-chain settlement availability for the platform in real time."
        />
        <div className="divide-y divide-hair/10 p-5">
          {/* $MONKI Mining Claiming Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-paper">$MONKI Mining Claiming</h3>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                    ps?.enableMonkiClaiming
                      ? "border-alive/30 bg-alive/10 text-alive-lit"
                      : "border-idle/30 bg-idle/10 text-idle"
                  }`}
                >
                  {ps?.enableMonkiClaiming ? "🟢 Active (TGE Live)" : "🟡 Gated (Pre-Launch)"}
                </span>
              </div>
              <p className="mt-1 text-xs text-paper-3 max-w-xl">
                When gated, users accumulate telemetry mining points on the dashboard, but the claim
                button shows "Pre-TGE Accrual". Flip to Active when liquidity pool launches on L2.
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
              {ps?.enableMonkiClaiming ? "Pause $MONKI Claims" : "Unlock $MONKI Claims (TGE)"}
            </button>
          </div>

          {/* $PONS Staking Payouts Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-paper">$PONS Staking Epoch Claims</h3>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                    ps?.enablePonsClaiming
                      ? "border-alive/30 bg-alive/10 text-alive-lit"
                      : "border-coral/30 bg-coral/10 text-coral"
                  }`}
                >
                  {ps?.enablePonsClaiming ? "🟢 Active" : "🔴 Paused"}
                </span>
              </div>
              <p className="mt-1 text-xs text-paper-3 max-w-xl">
                Controls daily epoch yield disbursements from platform pool wallet on Robinhood Chain.
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
              {ps?.enablePonsClaiming ? "Pause $PONS Claims" : "Enable $PONS Claims"}
            </button>
          </div>

          {/* Companion NFT Minting Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 last:pb-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-paper">Companion NFT Minting</h3>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                    ps?.enableCompanionMinting
                      ? "border-alive/30 bg-alive/10 text-alive-lit"
                      : "border-coral/30 bg-coral/10 text-coral"
                  }`}
                >
                  {ps?.enableCompanionMinting ? "🟢 Active" : "🔴 Paused"}
                </span>
              </div>
              <p className="mt-1 text-xs text-paper-3 max-w-xl">
                Controls on-chain ERC-721 mint transaction generation and milestone claiming.
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
              {ps?.enableCompanionMinting ? "Pause NFT Minting" : "Enable NFT Minting"}
            </button>
          </div>
        </div>
      </Panel>

      {/* Manual Airdrop & Credit Tool */}
      <Panel>
        <PanelHeader
          title="Manual Ledger Credit & Airdrop"
          hint="Directly credit claimable $MONKI or $PONS to a user wallet address."
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
            {airdrop.isPending ? "Crediting…" : "Execute Credit"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
