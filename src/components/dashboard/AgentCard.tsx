import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, Star, Users } from "lucide-react";

import type { Agent } from "@/features/api/types";
import { PowerMeter, StateChip, fmt } from "@/components/dashboard/primitives";
import { monkiiMark } from "@/lib/brand";
import { useWatchlist } from "@/hooks/useWatchlist";

/**
 * Modern Agent Fleet Card.
 * Precision telemetry gauge, live vitality indicator, and watchlist star.
 */
const AgentCard = ({ agent, compact = false }: { agent: Agent; compact?: boolean }) => {
  const { isStarred, toggleStar } = useWatchlist();
  const starred = isStarred(agent.id);

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-[#111713]/90 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-[#141b16] hover:shadow-xl hover:shadow-black/50">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/dashboard/agents/${agent.id}`} className="flex items-start gap-3 min-w-0 flex-1">
          <img
            src={agent.avatarUrl ?? monkiiMark}
            alt={agent.name}
            loading="lazy"
            className="h-11 w-11 shrink-0 rounded-xl border border-white/15 bg-white/5 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-display text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {agent.name}
              </h3>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-400" />
            </div>
            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
              {agent.xHandle ? `@${agent.xHandle}` : agent.category}
            </p>
          </div>
        </Link>

        {/* Watchlist star toggle */}
        <button
          type="button"
          aria-label={starred ? "Remove from watchlist" : "Add to watchlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleStar(agent.id);
          }}
          className={`grid h-8 w-8 place-items-center rounded-lg border transition-all ${
            starred
              ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
          }`}
        >
          <Star className={`h-4 w-4 ${starred ? "fill-amber-400 text-amber-400" : ""}`} />
        </button>
      </div>

      {!compact && agent.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {agent.description}
        </p>
      )}

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <StateChip state={agent.state} />
          <span className="font-mono text-[11px] font-semibold text-slate-400">
            {Math.round(agent.power)} pw
          </span>
        </div>
        <PowerMeter
          power={agent.power}
          max={agent.healthyThreshold || agent.power || 1}
          state={agent.state}
          showValue={false}
          segments={12}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
          <Users className="h-3.5 w-3.5 text-slate-500" />
          {fmt(agent.nurturerCount)} nurturers
        </span>

        <Link
          to={`/dashboard/agents/${agent.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-400 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/20"
        >
          <Heart className="h-3 w-3" />
          <span>Nurture</span>
        </Link>
      </div>
    </article>
  );
};

export default AgentCard;
