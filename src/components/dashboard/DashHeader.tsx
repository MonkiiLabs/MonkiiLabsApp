import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Coins, Flame, Home, Menu, Radar, Sparkles, Trophy } from "lucide-react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useWallet } from "@/hooks/useWallet";
import { useClaimable } from "@/features/api/hooks";
import { Wordmark } from "@/components/landing/Section";
import { fmt } from "@/components/dashboard/primitives";
import { BRAND } from "@/lib/brand";
import { WalletButton } from "@/components/dashboard/WalletButton";
import { NotificationsBell } from "@/components/dashboard/NotificationsBell";

export const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Radar, label: "Fleet", path: "/dashboard/agents" },
  { icon: Sparkles, label: "Companions", path: "/dashboard/companions" },
  { icon: Coins, label: "Staking", path: "/dashboard/staking" },
  { icon: Trophy, label: "Leaderboard", path: "/dashboard/leaderboard" },
  { icon: Flame, label: "Alerts", path: "/dashboard/alerts" },
];

const DashHeader = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useWallet();
  const { data: balances } = useClaimable();

  const isActive = (path: string) =>
    path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(path);

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] h-[64px] border-b border-hair/10 bg-bench/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="shrink-0 transition-opacity hover:opacity-90" aria-label="Monkii Labs home">
          <Wordmark size="sm" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden min-w-0 items-center gap-1.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive(item.path)
                  ? "border border-hair/14 bg-hair/[0.07] text-paper"
                  : "border border-transparent text-paper-3 hover:border-hair/10 hover:bg-hair/[0.05] hover:text-paper"
              }`}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section: Telemetry, Alerts, RainbowKit Wallet */}
        <div className="flex shrink-0 items-center gap-2.5">
          {isAuthenticated && (
            <div className="hidden items-center gap-2 rounded-xl border border-alive/20 bg-alive/5 px-3 py-1.5 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alive-lit opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-alive" />
              </span>
              <span className="whitespace-nowrap font-mono text-xs font-semibold tabular-nums text-alive-lit">
                {fmt(balances?.claimableMonki, 1)} {BRAND.rewardToken}
              </span>
            </div>
          )}

          {/* In-app Notifications Bell */}
          <NotificationsBell />

          {/* RainbowKit Connected Wallet Button */}
          <WalletButton />

          {/* Mobile hamburger */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="grid h-9 w-9 place-items-center rounded-xl border border-hair/10 bg-hair/[0.05] text-paper-2 transition-colors hover:bg-hair/10 hover:text-paper lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(20rem,86vw)] border-l border-hair/15 bg-bench p-0 text-paper"
            >
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
              <div className="border-b border-hair/10 p-4">
                <Wordmark size="sm" />
              </div>
              <nav className="flex flex-col p-4 gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive(item.path)
                        ? "border border-hair/14 bg-hair/[0.07] text-paper"
                        : "text-paper-2 hover:bg-hair/[0.05]"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default DashHeader;
