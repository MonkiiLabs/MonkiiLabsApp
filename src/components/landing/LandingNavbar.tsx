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
 * The nav rail. It sits on the bench rather than floating above a
 * different world, so it takes a hairline and one lightness step, no
 * ring, no lift, no coloured border on scroll. The only thing that
 * changes when you scroll is that the hairline appears.
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
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-xl border bg-bench/85 px-fib2 py-2 backdrop-blur-xl transition-colors duration-200 ${
          lifted ? "border-hair/12" : "border-transparent"
        }`}
      >
        <Link to="/" className="shrink-0 transition-opacity hover:opacity-90" aria-label="Monkii Labs home">
          <Wordmark size="sm" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 lg:flex">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className="label-mono text-paper-3 transition-colors hover:text-paper"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Right action tools: Enter App + RainbowKit Connect */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="act-quiet hidden h-9 items-center gap-1.5 px-fib3 font-mono text-micro font-semibold uppercase tracking-[0.16em] text-paper-2 sm:inline-flex"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-paper-3" />
            <span>Launch Cockpit</span>
          </Link>

          <WalletButton />

          {/* Mobile Sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="act-quiet grid h-9 w-9 place-items-center text-paper-2 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(20rem,86vw)] border-l border-hair/10 bg-bench-2 p-0 text-paper"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex items-center justify-between border-b border-hair/10 p-fib3">
                <Wordmark size="sm" />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-hair/10 text-paper-3"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex flex-col p-fib3">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollTo(s.id)}
                    className="flex items-baseline gap-fib2 border-b border-hair/[0.07] py-fib2 text-left label-mono text-paper-2 hover:text-paper"
                  >
                    <span className="text-paper-4">{String(i + 1).padStart(2, "0")}</span>
                    <span>{s.label}</span>
                  </button>
                ))}

                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="act mt-fib4 flex h-11 items-center justify-center gap-2 font-mono text-micro font-semibold uppercase tracking-[0.16em]"
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
