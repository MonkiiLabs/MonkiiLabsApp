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
    <article className="group relative flex h-full flex-col rounded-xl border border-hair/9 bg-bench-2 p-fib3 transition-colors duration-200 hover:border-hair/18 hover:bg-bench-3">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/dashboard/agents/${agent.id}`} className="flex items-start gap-3 min-w-0 flex-1">
          <img
            src={agent.avatarUrl ?? monkiiMark}
            alt={agent.name}
            loading="lazy"
            className="h-11 w-11 shrink-0 rounded-xl border border-hair/15 bg-hair/[0.05] object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-display text-base font-bold text-paper group-hover:text-alive-lit transition-colors">
                {agent.name}
              </h3>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-paper-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-alive-lit" />
            </div>
            <p className="mt-0.5 truncate font-mono text-[11px] text-paper-3">
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
              ? "border-idle/50 bg-idle/15 text-idle"
              : "border-hair/10 bg-hair/[0.05] text-paper-3 hover:border-hair/20 hover:text-paper"
          }`}
        >
          <Star className={`h-4 w-4 ${starred ? "fill-idle text-idle" : ""}`} />
        </button>
      </div>

      {!compact && agent.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-paper-3">
          {agent.description}
        </p>
      )}

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <StateChip state={agent.state} />
          <span className="font-mono text-[11px] font-semibold text-paper-3">
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

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-hair/[0.05] pt-3 text-xs text-paper-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
          <Users className="h-3.5 w-3.5 text-paper-4" />
          {fmt(agent.nurturerCount)} nurturers
        </span>

        <Link
          to={`/dashboard/agents/${agent.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-alive/20 bg-alive/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-alive-lit transition-all hover:border-alive-lit/40 hover:bg-alive/20"
        >
          <Heart className="h-3 w-3" />
          <span>Nurture</span>
        </Link>
      </div>
    </article>
  );
};

export default AgentCard;
