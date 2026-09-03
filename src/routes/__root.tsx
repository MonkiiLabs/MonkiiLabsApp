import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Activity, Award, Zap } from "lucide-react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4E6C8] text-[#171717] selection:bg-[#39A9E8] selection:text-white">
      <header className="border-b-2 border-[#171717] bg-white px-6 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-2xl tracking-tight">
            <span className="text-3xl">🐒</span>
            <span className="text-[#171717] font-black">MONKII</span>
            <span className="text-[#E74435] font-black">LABS</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#00C805] text-black font-semibold ml-2">
              Robinhood Chain L2
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-[#E74435] transition-colors flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Lab
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-[#171717] bg-[#F4E6C8] text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-[#E74435]" />
              <span>$MONKI: 0</span>
              <span className="text-gray-400">|</span>
              <Award className="w-3.5 h-3.5 text-[#00C805]" />
              <span>$PONS: 0</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
        <Outlet />
      </main>

      <footer className="border-t-2 border-[#171717] bg-white py-6 px-6 text-xs text-center text-gray-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Monkii Labs. Proof-of-Life Autonomous Agent Nurturing on Robinhood Chain.</p>
          <div className="flex items-center gap-4 font-semibold text-[#171717]">
            <span>$MONKI (Compute Receipt)</span>
            <span>•</span>
            <span>$PONS (Robinhood Chain)</span>
            <span>•</span>
            <span>$META Stock Token (50:50 Staking Split)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
