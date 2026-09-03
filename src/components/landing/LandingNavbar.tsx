import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, Wallet } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useWallet } from "@/hooks/useWallet";
import WalletConnectModal from "@/components/WalletConnectModal";
import { BRAND, monkiiLogo } from "@/lib/brand";

const SECTIONS = [
  { id: "how-it-works", label: "How It Works" },
  { id: "agents", label: "Agents" },
  { id: "companions", label: "Companions" },
  { id: "tokens", label: "Tokens" },
];

const LandingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, address, connect, disconnect, showConnectModal, setShowConnectModal } = useWallet();

  const scrollTo = useCallback(
    (id: string) => {
      setMobileMenuOpen(false);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    },
    [],
  );

  return (
    <>
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <img
            src={monkiiLogo}
            alt="MONKII LABS logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-playful transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          />
          <span className="text-lg sm:text-xl font-extrabold tracking-tight">
            <span className="text-coral">{BRAND.first}</span>
            <span className="text-claw-charcoal"> {BRAND.second}</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-bold text-claw-charcoal">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className="hover:text-coral transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-coral after:transition-all hover:after:w-full"
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
              className="rounded-full border-2 border-border bg-background/90 text-claw-charcoal hover:bg-background font-bold shadow-sm transition-all duration-200 btn-bounce px-3 sm:px-4 backdrop-blur"
            >
              <span className="text-lg mr-1">🐒</span>
              <span className="hidden lg:inline max-w-[140px] truncate">{address}</span>
              <span className="lg:hidden">Connected</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConnectModal(true)}
              className="rounded-full border-2 border-border bg-background/90 text-claw-charcoal hover:bg-background font-bold shadow-sm transition-all duration-200 btn-bounce backdrop-blur"
            >
              <Wallet className="w-4 h-4 mr-1" />
              <span className="hidden lg:inline">Connect Wallet</span>
              <span className="lg:hidden">Wallet</span>
            </Button>
          )}

          <Button
            size="sm"
            className="rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral transition-all duration-200 btn-bounce"
            asChild
          >
            <Link to="/dashboard">Start Nurturing</Link>
          </Button>
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (isConnected ? disconnect() : setShowConnectModal(true))}
            className="rounded-full p-2 bg-background/90 hover:bg-background shadow-sm border border-border backdrop-blur"
          >
            {isConnected ? <span className="text-lg">🐒</span> : <Wallet className="w-5 h-5 text-claw-charcoal" />}
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-2 bg-background/90 hover:bg-background shadow-sm border border-border backdrop-blur"
              >
                <Menu className="w-5 h-5 text-claw-charcoal" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white border-l-2 border-dashboard-border p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 p-4 border-b border-dashboard-border">
                  <img src={monkiiLogo} alt="" className="w-8 h-8 rounded-lg" />
                  <span className="font-extrabold text-lg">
                    <span className="text-coral">{BRAND.first}</span>
                    <span className="text-claw-charcoal"> {BRAND.second}</span>
                  </span>
                </div>

                <nav className="flex flex-col p-4 gap-2">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollTo(s.id)}
                      className="text-left py-3 px-4 rounded-xl font-bold text-claw-charcoal hover:bg-cream hover:text-coral transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-auto p-4 border-t border-dashboard-border">
                  <Button
                    className="w-full rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/dashboard">Start Nurturing</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <WalletConnectModal open={showConnectModal} onOpenChange={setShowConnectModal} onConnect={connect} />
    </>
  );
};

export default LandingNavbar;
