import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Cpu,
  Heart,
  Share2,
  Square,
  Star,
  Trash2,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAgent,
  useInventory,
  useEquipCompanion,
  useUnequipCompanion,
} from "@/features/api/hooks";
import { useNurture } from "@/features/monkii/useNurture";
import { useWallet } from "@/hooks/useWallet";
import { useWatchlist } from "@/hooks/useWatchlist";
import { playHeartbeatSound } from "@/lib/sound";
import type { Intensity } from "@/features/api/types";
import {
  AuthGate,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  Panel,
  PanelHeader,
  PowerMeter,
  Stat,
  StateChip,
  fmt,
} from "@/components/dashboard/primitives";
import { BRAND, monkiiMark } from "@/lib/brand";

const INTENSITIES: Array<{ value: Intensity; label: string; blurb: string }> = [
  { value: "light", label: "Light", blurb: "Low CPU/GPU overhead" },
  { value: "standard", label: "Standard", blurb: "Optimal compute loop" },
  { value: "max", label: "Max", blurb: "Maximum $MONKI throughput" },
];

const MAX_SLOTS = 3;

const AgentDetailInner = ({ agentId }: { agentId: string }) => {
  const { data, isLoading, isError, error, refetch } = useAgent(agentId);
  const inventory = useInventory();
  const equip = useEquipCompanion();
  const unequip = useUnequipCompanion();
  const { isStarred, toggleStar } = useWatchlist();

  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [elapsedSecs, setElapsedSecs] = useState(0);

  const nurture = useNurture(agentId);
  const starred = isStarred(agentId);
  const lastHeartbeatRef = useRef(nurture.stats.heartbeats);

  // Sound feedback on heartbeat increment.. 
  useEffect(() => {
    if (nurture.stats.heartbeats > lastHeartbeatRef.current) {
      lastHeartbeatRef.current = nurture.stats.heartbeats;
      playHeartbeatSound(!soundEnabled);
    }
  }, [nurture.stats.heartbeats, soundEnabled]);

  // Session elapsed timer
  useEffect(() => {
    if (!nurture.isRunning) {
      setElapsedSecs(0);
      return;
    }
    const timer = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [nurture.isRunning]);

  // Auto-pause when user switches away from tab (like ansem)
  useEffect(() => {
    if (!nurture.isRunning) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && nurture.isRunning) {
        void nurture.stop();
        toast.info("Nurturing paused", {
          description: "Proof-of-life compute was paused to protect your device resources.",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [nurture]);

  if (isLoading) return <LoadingPanel label="Connecting to agent stream" />;
  if (isError) return <ErrorPanel error={error} onRetry={refetch} />;
  if (!data) return null;

  const { agent, companionBuffs } = data;
  const power = nurture.power ?? agent.power;
  const state = nurture.state ?? agent.state;
  const max = agent.healthyThreshold || agent.power || 1;

  const equipped = companionBuffs?.companions ?? [];
  const freeSlots = MAX_SLOTS - equipped.length;
  const spare = (inventory.data ?? []).filter((c) => !c.equippedAgentId);

  // Format elapsed time MM:SS
  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Share to X intent (from ansem inspiration)
  const shareToX = () => {
    const text = encodeURIComponent(
      `I'm keeping @${agent.xHandle || agent.name} alive on @MonkiiLabs on Robinhood Chain! 🧬\n\nVitality: ${Math.round(
        power,
      )} pw (${state.toUpperCase()}) · Earned: ${fmt(
        nurture.stats.monkiEarned,
        1,
      )} $MONKI · Join the Proof-of-Life compute network:`,
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <div className="space-y-5">
      {/* Top Profile Card */}
      <Panel raised>
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="relative">
              <img
                src={agent.avatarUrl ?? monkiiMark}
                alt={agent.name}
                className="h-16 w-16 shrink-0 rounded-2xl border border-hair/15 bg-hair/[0.05] object-cover"
              />
              <span className="absolute -bottom-1 -right-1">
                <StateChip state={state} />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
                  {agent.name}
                </h1>
                {agent.xHandle && (
                  <a
                    href={`https://x.com/${agent.xHandle}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-mono text-xs text-alive-lit hover:text-alive-lit hover:underline"
                  >
                    @{agent.xHandle}
                  </a>
                )}
              </div>
              {agent.description && (
                <p className="mt-2 max-w-[64ch] text-xs leading-relaxed text-paper-3">
                  {agent.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Tools: Star & Share */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label={starred ? "Remove from watchlist" : "Add to watchlist"}
              onClick={() => toggleStar(agentId)}
              className={`grid h-9 w-9 place-items-center rounded-xl border transition-all ${
                starred
                  ? "border-idle/50 bg-idle/15 text-idle"
                  : "border-hair/10 bg-hair/[0.05] text-paper-3 hover:border-hair/20 hover:text-paper"
              }`}
            >
              <Star className={`h-4 w-4 ${starred ? "fill-idle text-idle" : ""}`} />
            </button>

            <button
              type="button"
              onClick={shareToX}
              title="Share to X"
              className="inline-flex items-center gap-1.5 rounded-xl border border-hair/10 bg-hair/[0.05] px-3 py-2 text-xs font-semibold text-paper-2 transition-all hover:border-hair/25 hover:bg-hair/10 hover:text-paper"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Vitality Gauge */}
        <div className="border-t border-hair/10 px-5 py-4">
          <PowerMeter power={power} max={max} state={state} segments={16} />
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-4 border-t border-hair/10 p-5 text-center sm:text-left">
          <Stat value={fmt(agent.nurturerCount)} label="Nurturers" />
          <Stat value={`−${fmt(agent.powerDecayRate, 1)}/m`} label="Power Decay" tone="coral" />
          <Stat
            value={`+${fmt(companionBuffs?.totalBonusEarnPct ?? 0, 0)}%`}
            label="Companion Buff"
            tone="vital"
          />
        </div>
      </Panel>

      {/* Proof-of-Life Activation Chamber Console */}
      <section className="overflow-hidden rounded-2xl border border-alive/30 bg-bench backdrop-blur-md">
        <header className="flex items-center justify-between border-b border-alive/20 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-alive-lit ${
                  nurture.isRunning ? "animate-ping opacity-75" : "opacity-20"
                }`}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-alive" />
            </span>
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-alive-lit">
              Proof-of-Life Activation Chamber
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {nurture.isRunning && (
              <span className="font-mono text-xs font-bold text-alive-lit">
                {formatTimer(elapsedSecs)}
              </span>
            )}
            <button
              type="button"
              aria-label={soundEnabled ? "Mute audio feedback" : "Enable audio feedback"}
              onClick={() => setSoundEnabled((v) => !v)}
              className="text-paper-3 hover:text-paper transition-colors"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-alive-lit" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <div className="p-5">
          {/* Real-time Telemetry Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-hair/[0.05] bg-hair/[0.02] p-3.5">
              <div className="font-display text-2xl font-bold tabular-nums text-alive-lit">
                {nurture.stats.heartbeats}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-paper-3">
                Heartbeats Sent
              </div>
            </div>

            <div className="rounded-xl border border-hair/[0.05] bg-hair/[0.02] p-3.5">
              <div className="font-display text-2xl font-bold tabular-nums text-paper">
                +{fmt(nurture.stats.monkiEarned, 2)}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-paper-3">
                {BRAND.rewardToken} Earned
              </div>
            </div>

            <div className="rounded-xl border border-hair/[0.05] bg-hair/[0.02] p-3.5">
              <div className="font-display text-2xl font-bold tabular-nums text-alive-lit">
                ×{nurture.stats.lastMultiplier.toFixed(2)}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-paper-3">
                Epoch Multiplier
              </div>
            </div>

            <div className="rounded-xl border border-hair/[0.05] bg-hair/[0.02] p-3.5">
              <div className="font-display text-2xl font-bold tabular-nums text-paper">
                {nurture.stats.hashRate ? `${fmt(nurture.stats.hashRate)} H/s` : "-"}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-paper-3">
                Compute Hash Rate
              </div>
            </div>
          </div>

          {/* Intensity Selector */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-paper-3">Load Intensity:</span>
              <div className="flex rounded-xl border border-hair/10 bg-hair/[0.05] p-1">
                {INTENSITIES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={nurture.isRunning}
                    onClick={() => setIntensity(opt.value)}
                    title={opt.blurb}
                    className={`rounded-lg px-3 py-1 font-mono text-xs font-semibold transition-all disabled:opacity-40 ${
                      intensity === opt.value
                        ? "bg-act text-paper"
                        : "text-paper-3 hover:text-paper"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {nurture.difficulty != null && (
              <span className="font-mono text-[11px] text-paper-4">
                Target Difficulty: {nurture.difficulty} bits
              </span>
            )}
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={() => void nurture.toggle(intensity)}
            disabled={nurture.phase === "starting" || nurture.phase === "stopping"}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.99] disabled:opacity-50 ${
              nurture.isRunning
                ? "border border-act/40 bg-act/15 text-act-lit hover:bg-act/25"
                : "bg-act text-paper hover:bg-act-lit"
            }`}
          >
            {nurture.isRunning ? (
              <>
                <Square className="h-4 w-4" /> Stop Proof-of-Life Session
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 animate-pulse" /> Start Nurturing (Prove Presence)
              </>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-2 font-mono text-[11px] text-paper-4">
            <Cpu className="h-3.5 w-3.5 text-paper-4" />
            Runs client-side in a Web Worker · Zero UI blocking · Auto-pauses on background tab
          </p>
          {nurture.error && <p className="mt-2 text-center text-xs text-act-lit">{nurture.error}</p>}
        </div>
      </section>

      {/* Companion Collectibles Slots */}
      <Panel>
        <PanelHeader
          title={`Companion Slots · ${equipped.length}/${MAX_SLOTS}`}
          hint="Off-chain equipment is instantaneous and 100% gasless on Robinhood Chain."
        />
        <div className="space-y-3 p-5">
          {equipped.map((c) => (
            <div
              key={c.userCompanionId}
              className="flex items-center gap-3.5 rounded-xl border border-hair/10 bg-hair/[0.05] p-3"
            >
              <img
                src={c.imageUrl ?? `/companions/${c.companionId}.jpg`}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg border border-hair/15 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-paper">{c.name}</p>
                <p className="text-[11px] text-paper-3">
                  +{c.bonusEarnPct}% Earn Boost · {c.decayReductionPct}% Power Decay Shield
                </p>
              </div>
              <button
                type="button"
                aria-label={`Unequip ${c.name}`}
                onClick={() => unequip.mutate(c.userCompanionId)}
                disabled={unequip.isPending}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-hair/10 bg-hair/[0.05] text-act-lit transition-colors hover:bg-act/20 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {equipped.length === 0 && (
            <EmptyPanel
              title="No companions equipped"
              body="Companions grant permanent passive earn rate boosts and power decay resistance to this agent."
            />
          )}

          {freeSlots > 0 && spare.length > 0 && (
            <div className="rounded-xl border border-dashed border-hair/15 p-4">
              <p className="font-mono text-xs uppercase tracking-wider text-paper-3">
                Equip from your Inventory
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {spare.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={equip.isPending}
                    onClick={() =>
                      equip.mutate({
                        userCompanionId: c.id,
                        agentId,
                        slotIndex: equipped.length + 1,
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-hair/10 bg-hair/[0.05] py-1.5 pl-1.5 pr-3 text-xs font-medium text-paper transition-colors hover:border-alive/30 hover:bg-hair/10 disabled:opacity-50"
                  >
                    <img
                      src={c.imageUrl ?? `/companions/${c.slug}.jpg`}
                      alt=""
                      className="h-6 w-6 rounded-lg object-cover"
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {freeSlots > 0 && spare.length === 0 && (
            <p className="text-xs text-paper-3">
              No unequipped companions in inventory.{" "}
              <Link to="/dashboard/companions" className="font-semibold text-alive-lit hover:underline">
                Mint free companions
              </Link>{" "}
              (standard ETH network gas only).
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
};

const AgentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useWallet();

  return (
    <>
      <Link
        to="/dashboard/agents"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-paper-3 hover:text-alive-lit transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Fleet Telemetry
      </Link>

      {!id ? (
        <ErrorPanel error={new Error("No agent specified.")} />
      ) : isAuthenticated ? (
        <AgentDetailInner agentId={id} />
      ) : (
        <AuthGate what="this agent and start a Proof-of-Life heartbeat">
          <AgentDetailInner agentId={id} />
        </AuthGate>
      )}
    </>
  );
};

export default AgentDetailPage;
