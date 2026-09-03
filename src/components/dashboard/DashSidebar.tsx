import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useMonkii } from "@/features/monkii/store";
import { useWallet } from "@/hooks/useWallet";
import { AGENT_STATE_META, POOL_STATS } from "@/features/monkii/data";
import { BRAND, monkiiLogo } from "@/lib/brand";

const DashSidebar = () => {
  const { address, formatAddress } = useWallet();
  const { agentsBalance, staked, ansemClaimed, totalHeartbeats, streakDays, earnMultiplier, agents, getState, activeAgentId } =
    useMonkii();

  const watchlist = agents.slice(0, 3);

  return (
    <div className="space-y-3">
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl overflow-hidden card-playful">
        <div className="h-16 bg-sky-gradient" />
        <div className="px-4 pb-4 -mt-8">
          <img
            src={monkiiLogo}
            alt=""
            className="w-16 h-16 rounded-2xl border-4 border-white shadow-sm bg-white"
          />
          <p className="mt-2 text-sm font-extrabold text-claw-charcoal">
            {address ? formatAddress(address) : "Guest nurturer"}
          </p>
          <p className="text-xs text-claw-gray-600 font-medium">
            {streakDays}-day thriving streak · {totalHeartbeats.toLocaleString()} heartbeats
          </p>
          <Link
            to="/dashboard/profile"
            className="mt-3 inline-block text-xs font-extrabold text-sky-dark hover:text-coral transition-colors"
          >
            View my profile →
          </Link>
        </div>
      </Card>

      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-claw-gray-600 mb-3">
          My balances
        </h3>
        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-claw-gray-600 font-medium">{BRAND.rewardToken}</dt>
            <dd className="font-extrabold text-claw-charcoal tabular-nums">
              {Math.floor(agentsBalance).toLocaleString()}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-claw-gray-600 font-medium">Staked</dt>
            <dd className="font-extrabold text-claw-charcoal tabular-nums">{staked.toLocaleString()}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-claw-gray-600 font-medium">{BRAND.valueToken} claimed</dt>
            <dd className="font-extrabold text-coral tabular-nums">{ansemClaimed.toFixed(1)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-claw-gray-600 font-medium">Earn multiplier</dt>
            <dd className="font-extrabold text-human-green tabular-nums">×{earnMultiplier.toFixed(2)}</dd>
          </div>
        </dl>
        <Link
          to="/dashboard/staking"
          className="mt-4 block text-center text-xs font-extrabold text-white bg-coral hover:bg-coral-dark rounded-full py-2.5 transition-colors"
        >
          Manage stake
        </Link>
        {staked < POOL_STATS.minStake && (
          <p className="mt-2 text-[11px] text-claw-gray-600 leading-relaxed">
            Stake at least {POOL_STATS.minStake} {BRAND.rewardToken} to qualify for the epoch reward.
          </p>
        )}
      </Card>

      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-claw-gray-600 mb-3">
          Watchlist
        </h3>
        <ul className="space-y-2">
          {watchlist.map((agent) => {
            const meta = AGENT_STATE_META[getState(agent.id)];
            return (
              <li key={agent.id}>
                <Link
                  to={`/dashboard/agents/${agent.id}`}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-cream transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-base">
                    {agent.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-claw-charcoal truncate">{agent.name}</span>
                    <span className={`block text-[11px] font-extrabold ${meta.text}`}>{meta.label}</span>
                  </span>
                  {activeAgentId === agent.id && (
                    <span className="w-2 h-2 rounded-full bg-human-green animate-pulse" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
};

export default DashSidebar;
