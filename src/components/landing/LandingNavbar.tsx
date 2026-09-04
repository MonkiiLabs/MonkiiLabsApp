import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Menu, X } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Wordmark } from "@/components/landing/Section";
import { WalletButton } from "@/components/dashboard/WalletButton";

const SECTIONS = [
  { id: "problem", label: "Problem" },
  { id: "loop", label: "The Loop" },
  { id: "agents", label: "Fleet" },
  { id: "companions", label: "Companions" },
  { id: "tokens", label: "Tokenomics" },
];

/**
 * Modern floating glass navigation bar.
 */
const LandingNavbar = () => {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setOpen(false);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border bg-[#0a0e0b]/85 px-4 py-2.5 backdrop-blur-xl transition-all duration-200 ${
          lifted
            ? "border-emerald-500/30 shadow-2xl shadow-black/80"
            : "border-white/10 shadow-lg shadow-black/40"
        }`}
      >
        <Link to="/" className="shrink-0 transition-opacity hover:opacity-90" aria-label="Monkii Labs — home">
          <Wordmark size="sm" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 lg:flex">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className="font-mono text-xs font-medium uppercase tracking-wider text-slate-300 transition-colors hover:text-emerald-400"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Right action tools: Enter App + RainbowKit Connect */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs font-semibold text-slate-200 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
            <span>Launch Cockpit</span>
          </Link>

          <WalletButton />

          {/* Mobile Sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(20rem,86vw)] border-l border-white/15 bg-[#0a0e0b] p-0 text-white"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <Wordmark size="sm" />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex flex-col p-4">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollTo(s.id)}
                    className="flex items-baseline gap-3 border-b border-white/5 py-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-emerald-400"
                  >
                    <span className="text-emerald-400">{String(i + 1).padStart(2, "0")}</span>
                    <span>{s.label}</span>
                  </button>
                ))}

                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Launch Cockpit
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
};

export default LandingNavbar;
