import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";
import { useMonkii } from "@/features/monkii/store";
import { AGENT_STATE_META, RARITY_STYLES } from "@/features/monkii/data";
import { BRAND, monkiiBanner, monkiiLogo } from "@/lib/brand";

const ProfilePage = () => {
  const { address, formatAddress, isConnected, setShowConnectModal } = useWallet();
  const {
    agentsBalance,
    staked,
    ansemClaimed,
    totalHeartbeats,
    streakDays,
    earnMultiplier,
    agents,
    equippedFor,
    getState,
    heartbeats,
    reset,
  } = useMonkii();

  const nurtured = agents.filter((a) => (heartbeats[a.id] ?? 0) > 0 || equippedFor(a.id).length > 0);

  return (
    <div className="space-y-3">
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl overflow-hidden">
        <img src={monkiiBanner} alt="" className="w-full h-28 sm:h-40 object-cover" />
        <div className="px-5 pb-5 -mt-10">
          <img
            src={monkiiLogo}
            alt=""
            className="w-20 h-20 rounded-3xl border-4 border-white shadow-playful bg-white"
          />
          <h1 className="mt-3 text-xl font-extrabold text-claw-charcoal">
            {address ? formatAddress(address) : "Guest nurturer"}
          </h1>
          <p className="text-sm text-claw-gray-600 font-medium">
            {streakDays}-day thriving streak · {totalHeartbeats.toLocaleString()} lifetime heartbeats
          </p>
          {!isConnected && (
            <Button
              onClick={() => setShowConnectModal(true)}
              className="mt-4 rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral"
            >
              Connect wallet to claim rewards
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: `${BRAND.rewardToken} balance`, value: Math.floor(agentsBalance).toLocaleString() },
          { label: "Staked", value: staked.toLocaleString() },
          { label: `${BRAND.valueToken} claimed`, value: ansemClaimed.toFixed(1) },
          { label: "Earn multiplier", value: `×${earnMultiplier.toFixed(2)}` },
        ].map((s) => (
          <Card key={s.label} className="border-2 border-dashboard-border bg-white rounded-2xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-claw-gray-600">{s.label}</p>
            <p className="text-lg font-extrabold text-claw-charcoal tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-5">
        <h2 className="text-base font-extrabold text-claw-charcoal mb-3">Agents I care for</h2>
        {nurtured.length === 0 ? (
          <p className="text-sm text-claw-gray-600">
            No contributions yet.{" "}
            <Link to="/dashboard/agents" className="font-extrabold text-sky-dark hover:text-coral">
              Pick an agent
            </Link>{" "}
            and start a heartbeat.
          </p>
        ) : (
          <ul className="space-y-2">
            {nurtured.map((a) => {
              const meta = AGENT_STATE_META[getState(a.id)];
              const companions = equippedFor(a.id);
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-2xl border-2 border-dashboard-border p-3"
                >
                  <span className="w-11 h-11 shrink-0 rounded-2xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-xl">
                    {a.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link
                      to={`/dashboard/agents/${a.id}`}
                      className="block text-sm font-extrabold text-claw-charcoal hover:text-coral truncate"
                    >
                      {a.name}
                    </Link>
                    <span className={`block text-xs font-extrabold ${meta.text}`}>
                      {meta.label} · {(heartbeats[a.id] ?? 0).toLocaleString()} heartbeats
                    </span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {companions.map((c) => (
                      <span
                        key={c.id}
                        title={c.name}
                        className={`w-8 h-8 rounded-xl ${RARITY_STYLES[c.rarity].bg} border-2 ${RARITY_STYLES[c.rarity].border} flex items-center justify-center text-sm`}
                      >
                        {c.emoji}
                      </span>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="border-2 border-dashboard-border bg-cream rounded-2xl p-5">
        <h2 className="text-sm font-extrabold text-claw-charcoal">Demo controls</h2>
        <p className="text-xs text-claw-gray-600 mt-1 leading-relaxed">
          This build runs the nurturing loop locally in your browser so the whole experience is
          explorable without a backend. Reset to restore the starting state.
        </p>
        <Button
          onClick={() => {
            reset();
            toast.success("Demo state reset");
          }}
          variant="outline"
          className="mt-3 rounded-full font-bold border-2 border-dashboard-border text-claw-charcoal hover:text-coral hover:border-coral bg-white"
        >
          Reset demo state
        </Button>
      </Card>
    </div>
  );
};

export default ProfilePage;
