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
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-hair/10 bg-hair/[0.05] text-paper-2 transition-all hover:border-alive/40 hover:bg-alive/10 hover:text-paper"
        >
          <Bell className="h-4 w-4" />
          {urgentCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-act px-1 text-[9px] font-bold text-paper ring-2 ring-[#0c100d] animate-pulse">
              {urgentCount}
            </span>
          ) : totalAlerts > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-idle ring-2 ring-[#0c100d]" />
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 rounded-2xl border border-hair/15 bg-[#0f1410]/95 p-0 text-paper backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-hair/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alive-lit opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-alive" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-paper-2">
              Vitality Telemetry
            </span>
          </div>
          <span className="rounded-full bg-hair/10 px-2 py-0.5 text-[10px] font-medium text-paper-3">
            {totalAlerts} at risk
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-hair/[0.05] p-1">
          {fadingAgents.length > 0 && (
            <div className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-act-lit">
              Critical: fading
            </div>
          )}
          {fadingAgents.slice(0, 4).map((agent) => (
            <Link
              key={agent.id}
              to={`/dashboard/agents/${agent.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-act/10"
            >
              <img
                src={agent.avatarUrl ?? monkiiMark}
                alt=""
                className="h-8 w-8 rounded-lg border border-act/40 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-semibold text-paper">{agent.name}</span>
                  <span className="font-mono text-[10px] font-bold text-act-lit">
                    {Math.round(agent.power)} pw
                  </span>
                </div>
                <p className="text-[11px] text-red-300/80">Power depleted below threshold</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-act/20 text-act-lit">
                <Heart className="h-3.5 w-3.5 animate-pulse" />
              </span>
            </Link>
          ))}

          {idleAgents.length > 0 && (
            <div className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-idle">
              Needs attention: idle
            </div>
          )}
          {idleAgents.slice(0, 3).map((agent) => (
            <Link
              key={agent.id}
              to={`/dashboard/agents/${agent.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-idle/10"
            >
              <img
                src={agent.avatarUrl ?? monkiiMark}
                alt=""
                className="h-8 w-8 rounded-lg border border-idle/30 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-semibold text-paper">{agent.name}</span>
                  <span className="font-mono text-[10px] font-bold text-idle">
                    {Math.round(agent.power)} pw
                  </span>
                </div>
                <p className="text-[11px] text-idle/70">Ready for Proof-of-Life compute</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-idle/20 text-idle">
                <Zap className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}

          {totalAlerts === 0 && (
            <div className="p-6 text-center text-xs text-paper-3">
              All monitored agents are currently thriving.
            </div>
          )}
        </div>

        <div className="border-t border-hair/10 p-2 text-center">
          <Link
            to="/dashboard/agents"
            onClick={() => setOpen(false)}
            className="block rounded-lg py-1.5 text-xs font-medium text-alive-lit transition-colors hover:bg-hair/[0.05]"
          >
            View all fleet agents →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
