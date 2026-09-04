import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Heart, Zap } from "lucide-react";

import { useAgents } from "@/features/api/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { monkiiMark } from "@/lib/brand";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { data: agents = [] } = useAgents();

  // Filter agents needing attention (fading takes highest priority, then idle)
  const fadingAgents = agents.filter((a) => a.state === "fading");
  const idleAgents = agents.filter((a) => a.state === "idle");
  const urgentCount = fadingAgents.length;
  const totalAlerts = urgentCount + idleAgents.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Vitality alerts"
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          {urgentCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#0c100d] animate-pulse">
              {urgentCount}
            </span>
          ) : totalAlerts > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#0c100d]" />
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 rounded-2xl border border-white/15 bg-[#0f1410]/95 p-0 text-slate-100 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
              Vitality Telemetry
            </span>
          </div>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">
            {totalAlerts} at risk
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-white/5 p-1">
          {fadingAgents.length > 0 && (
            <div className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-red-400">
              Critical — Fading
            </div>
          )}
          {fadingAgents.slice(0, 4).map((agent) => (
            <Link
              key={agent.id}
              to={`/dashboard/agents/${agent.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-red-500/10"
            >
              <img
                src={agent.avatarUrl ?? monkiiMark}
                alt=""
                className="h-8 w-8 rounded-lg border border-red-500/40 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-semibold text-white">{agent.name}</span>
                  <span className="font-mono text-[10px] font-bold text-red-400">
                    {Math.round(agent.power)} pw
                  </span>
                </div>
                <p className="text-[11px] text-red-300/80">Power depleted below threshold</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-500/20 text-red-400">
                <Heart className="h-3.5 w-3.5 animate-pulse" />
              </span>
            </Link>
          ))}

          {idleAgents.length > 0 && (
            <div className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Needs Attention — Idle
            </div>
          )}
          {idleAgents.slice(0, 3).map((agent) => (
            <Link
              key={agent.id}
              to={`/dashboard/agents/${agent.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-amber-500/10"
            >
              <img
                src={agent.avatarUrl ?? monkiiMark}
                alt=""
                className="h-8 w-8 rounded-lg border border-amber-500/30 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-semibold text-white">{agent.name}</span>
                  <span className="font-mono text-[10px] font-bold text-amber-400">
                    {Math.round(agent.power)} pw
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/70">Ready for Proof-of-Life compute</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/20 text-amber-400">
                <Zap className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}

          {totalAlerts === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              All monitored agents are currently thriving.
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-2 text-center">
          <Link
            to="/dashboard/agents"
            onClick={() => setOpen(false)}
            className="block rounded-lg py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-white/5"
          >
            View all fleet agents →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
