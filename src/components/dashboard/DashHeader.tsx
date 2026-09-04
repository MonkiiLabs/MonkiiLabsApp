import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Coins, Flame, Home, Menu, Radar, Sparkles, Trophy, User } from "lucide-react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useWallet } from "@/hooks/useWallet";
import { useClaimable } from "@/features/api/hooks";
import { Wordmark } from "@/components/landing/Section";
import { fmt } from "@/components/dashboard/primitives";
import { BRAND } from "@/lib/brand";
import { WalletButton } from "@/components/dashboard/WalletButton";
import { NotificationsBell } from "@/components/dashboard/NotificationsBell";

/**
 * The app header.
 *
 * Navigation is a hamburger at every width, not just on mobile. The
 * previous header ran six inline links across the desktop bar alongside
 * the balance readout, the bell and the wallet control, which left the
 * top of every dashboard page crowded and competing with the page's own
 * title. One button opens the whole map instead, so the bar carries only
 * the wordmark, live balance, alerts and wallet.
 */
export const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Radar, label: "Fleet", path: "/dashboard/agents" },
  { icon: Sparkles, label: "Companions", path: "/dashboard/companions" },
  { icon: Coins, label: "Staking", path: "/dashboard/staking" },
  { icon: Trophy, label: "Leaderboard", path: "/dashboard/leaderboard" },
  { icon: Flame, label: "Alerts", path: "/dashboard/alerts" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

const DashHeader = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useWallet();
  const { data: balances } = useClaimable();

  // A route change from anywhere (a card link, the browser back button)
  // should close the menu, not just a click on one of its own entries.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isActive = (path: string) =>
    path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(path);

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[64px] border-b-2 border-dashboard-border bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-dashboard-border bg-white text-claw-charcoal transition-all hover:border-sky/50 hover:bg-dashboard-hover btn-bounce"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-[min(20rem,86vw)] flex-col border-r-2 border-dashboard-border bg-white p-0"
            >
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>

              <div className="border-b-2 border-dashboard-border p-4">
                <Wordmark size="sm" />
              </div>

              <nav className="flex flex-col gap-1.5 p-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                      isActive(item.path)
                        ? "bg-coral/10 text-coral-dark"
                        : "text-claw-charcoal hover:bg-cream hover:text-coral"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto border-t-2 border-dashboard-border p-4">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-bold text-claw-gray-600 transition-colors hover:bg-cream hover:text-coral"
                >
                  Back to site
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="group min-w-0 shrink" aria-label="Monkii Labs home">
            <Wordmark size="sm" />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {isAuthenticated && (
            <div className="hidden items-center gap-2 rounded-full border-2 border-human-green/25 bg-human-green-bg px-3 py-1.5 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-human-green opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-human-green" />
              </span>
              <span className="whitespace-nowrap text-xs font-extrabold tabular-nums text-human-green">
                {fmt(balances?.claimableMonki, 1)} {BRAND.rewardToken}
              </span>
            </div>
          )}

          <NotificationsBell />
          <WalletButton />
        </div>
      </div>
    </header>
  );
};

export default DashHeader;
