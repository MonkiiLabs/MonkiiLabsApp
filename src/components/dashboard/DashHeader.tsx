import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Radar, Sparkles, Coins, Trophy, Bell, Menu, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useWallet } from "@/hooks/useWallet";
import { useMonkii } from "@/features/monkii/store";
import { BRAND, monkiiLogo } from "@/lib/brand";

export const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Radar, label: "Agents", path: "/dashboard/agents" },
  { icon: Sparkles, label: "Companions", path: "/dashboard/companions" },
  { icon: Coins, label: "Staking", path: "/dashboard/staking" },
  { icon: Trophy, label: "Leaderboard", path: "/dashboard/leaderboard" },
  { icon: Bell, label: "Alerts", path: "/dashboard/alerts" },
];

const DashHeader = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isConnected, address, formatAddress, setShowConnectModal, disconnect } = useWallet();
  const { agentsBalance, unreadCount, activeAgentId } = useMonkii();

  const isActive = (path: string) =>
    path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] sm:h-[68px] bg-white border-b-2 border-dashboard-border z-[1000] shadow-sm">
      <div className="max-w-[1180px] mx-auto h-full flex items-center justify-between gap-3 px-3 sm:px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0 hover:scale-105 transition-transform">
          <img src={monkiiLogo} alt="MONKII LABS" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-sm" />
          <span className="hidden md:inline text-sm font-extrabold tracking-tight">
            <span className="text-coral">{BRAND.first}</span>
            <span className="text-claw-charcoal"> {BRAND.second}</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                isActive(item.path)
                  ? "text-coral bg-coral/10"
                  : "text-claw-gray-600 hover:text-coral hover:bg-cream"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.label === "Alerts" && unreadCount > 0 && (
                <span className="absolute top-0 right-2 min-w-[16px] h-4 px-1 rounded-full bg-coral text-white text-[10px] font-extrabold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-full bg-cream border-2 border-dashboard-border">
            <span className="text-sm">🍌</span>
            <span className="text-xs font-extrabold text-claw-charcoal tabular-nums">
              {Math.floor(agentsBalance).toLocaleString()} {BRAND.rewardToken}
            </span>
            {activeAgentId && (
              <span className="w-2 h-2 rounded-full bg-human-green animate-pulse" title="Heartbeat running" />
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => (isConnected ? disconnect() : setShowConnectModal(true))}
            className="rounded-full border-2 border-dashboard-border bg-white text-claw-charcoal hover:text-coral hover:border-coral font-bold"
          >
            {isConnected ? (
              <>
                <span className="mr-1.5">🐒</span>
                <span className="max-w-[110px] truncate">{address ? formatAddress(address) : "Connected"}</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Connect</span>
              </>
            )}
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden rounded-full p-2 border-2 border-dashboard-border">
                <Menu className="w-5 h-5 text-claw-charcoal" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white border-l-2 border-dashboard-border p-0">
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
              <nav className="flex flex-col p-4 gap-1.5 pt-6">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                      isActive(item.path) ? "bg-coral/10 text-coral" : "text-claw-charcoal hover:bg-cream"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.label === "Alerts" && unreadCount > 0 && (
                      <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-coral text-white text-[11px] font-extrabold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                ))}
                <Link
                  to="/dashboard/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-claw-charcoal hover:bg-cream"
                >
                  🐒 My profile
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default DashHeader;
