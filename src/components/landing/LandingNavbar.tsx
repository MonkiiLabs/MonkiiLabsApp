import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Wordmark } from "@/components/landing/Section";
import { WalletButton } from "@/components/dashboard/WalletButton";

/**
 * The landing navbar, back to the original floating pill treatment: it
 * sits directly on the sky with no bar behind it, so the clouds drift
 * past underneath.
 *
 * The one thing not reverted is the wallet control. The original used a
 * hand-rolled WalletConnectModal; this keeps the current RainbowKit
 * WalletButton, which is what actually connects to Robinhood Chain and
 * signs the session.
 */
const SECTIONS = [
  { id: "how-it-works", label: "How It Works" },
  { id: "agents", label: "Agents" },
  { id: "companions", label: "Companions" },
  { id: "tokens", label: "Tokens" },
];

const LandingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = useCallback((id: string) => {
    setMobileMenuOpen(false);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  return (
    <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
      <Link to="/" className="group">
        <Wordmark size="md" />
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
        <WalletButton />

        <Button
          size="sm"
          className="rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral transition-all duration-200 btn-bounce"
          asChild
        >
          <Link to="/dashboard">Start Nurturing</Link>
        </Button>
      </div>

      <div className="flex sm:hidden items-center gap-2">
        <WalletButton />

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
                <Wordmark size="sm" />
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
  );
};

export default LandingNavbar;
