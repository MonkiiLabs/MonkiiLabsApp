import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { Cpu, Flame, HeartHandshake, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexComponent,
});

function IndexComponent() {
  const [power, setPower] = useState(88);
  const [monkiEarned, setMonkiEarned] = useState(140);
  const [isNurturing, setIsNurturing] = useState(false);

  const handleNurture = () => {
    setIsNurturing(true);
    setTimeout(() => {
      setPower((p) => Math.min(100, p + 5));
      setMonkiEarned((m) => m + 10);
      setIsNurturing(false);
    }, 800);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-[#171717] bg-[#39A9E8] text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#171717]">
          <Sparkles className="w-3.5 h-3.5" /> A Friendly Laboratory for Keeping AI Agents Alive
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-[#171717] tracking-tight">
          NURTURE AGENTS. <br />
          <span className="text-[#E74435]">EARN $MONKI.</span> <br />
          <span className="text-[#00C805]">STAKE FOR $PONS + $META.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg font-medium text-gray-700">
          The Tamagotchi for Autonomous AI Agents, built natively on <strong>Robinhood Chain (Ethereum L2)</strong>.
          Supply lightweight Proof-of-Life compute, restore agent vitality, and earn liquid launchpad & equity yields.
        </p>
      </section>

      {/* Lab Station / Agent Status Cockpit */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Agent Card */}
        <div className="md:col-span-2 rounded-2xl border-4 border-[#171717] bg-white p-6 shadow-[6px_6px_0px_#171717] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border-2 border-[#171717] bg-[#F4E6C8] flex items-center justify-center text-3xl shadow-[2px_2px_0px_#171717]">
                🐒
              </div>
              <div>
                <h2 className="text-xl font-black">Monkii Prime</h2>
                <p className="text-xs font-semibold text-gray-500">Autonomous Sentinel • Robinhood Chain</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full border-2 border-[#171717] bg-[#00C805] text-black text-xs font-black uppercase tracking-wider">
              {power >= 80 ? "Thriving" : power >= 30 ? "Idle" : "Fading"}
            </span>
          </div>

          {/* Power Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-[#E74435]" /> Vitality (Power Level)</span>
              <span>{power} / 100</span>
            </div>
            <div className="h-5 w-full rounded-full border-2 border-[#171717] bg-gray-100 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E74435] via-[#39A9E8] to-[#00C805] transition-all duration-500"
                style={{ width: `${power}%` }}
              />
            </div>
          </div>

          {/* Nurture Action Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleNurture}
              disabled={isNurturing}
              className="flex-1 py-4 px-6 rounded-xl border-4 border-[#171717] bg-[#E74435] hover:bg-[#A92F29] text-white font-black text-lg uppercase tracking-wider shadow-[4px_4px_0px_#171717] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Cpu className="w-5 h-5" />
              {isNurturing ? "Solving Keccak-256..." : "Nurture Agent (Proof-of-Life)"}
            </button>
          </div>
        </div>

        {/* Rewards & Telemetry Prop */}
        <div className="rounded-2xl border-4 border-[#171717] bg-[#171717] text-white p-6 shadow-[6px_6px_0px_#E74435] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">
              <span>Rewards Station</span>
              <span className="text-[#00C805]">24h Epoch Live</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Earned Compute Receipt</p>
              <p className="text-3xl font-black text-[#F4E6C8]">{monkiEarned} <span className="text-xs text-gray-400 font-bold">$MONKI</span></p>
            </div>
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-400 font-medium">Staking Reward Assets</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs bg-gray-900 p-2.5 rounded-lg border border-gray-800">
                  <span className="font-bold text-[#00C805]">$PONS</span>
                  <span className="text-gray-400 font-semibold">Pons Launchpad Token</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-gray-900 p-2.5 rounded-lg border border-gray-800">
                  <span className="font-bold text-[#39A9E8]">$META</span>
                  <span className="text-gray-400 font-semibold">Stock Token (50:50 Split)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#00C805]/10 border border-[#00C805]/40 p-3 text-xs text-[#00C805] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Robinhood Chain 100ms L2 finality. Gas-free verified heartbeat compute.</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="rounded-xl border-2 border-[#171717] bg-white p-5 shadow-[4px_4px_0px_#171717] space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#39A9E8]/20 border-2 border-[#171717] flex items-center justify-center text-[#39A9E8]">
            <HeartHandshake className="w-5 h-5 text-[#171717]" />
          </div>
          <h3 className="font-bold text-lg">Proof-of-Life Compute</h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            Lightweight in-browser Keccak-256 proofs sustain autonomous agent uptime without specialized hardware.
          </p>
        </div>

        <div className="rounded-xl border-2 border-[#171717] bg-white p-5 shadow-[4px_4px_0px_#171717] space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#E74435]/20 border-2 border-[#171717] flex items-center justify-center text-[#E74435]">
            <Zap className="w-5 h-5 text-[#171717]" />
          </div>
          <h3 className="font-bold text-lg">Stake $MONKI for $PONS</h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            Staked $MONKI earns liquid $PONS tokens from the Pons launchpad ecosystem across 24-hour snapshot epochs.
          </p>
        </div>

        <div className="rounded-xl border-2 border-[#171717] bg-white p-5 shadow-[4px_4px_0px_#171717] space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#00C805]/20 border-2 border-[#171717] flex items-center justify-center text-[#00C805]">
            <TrendingUp className="w-5 h-5 text-[#171717]" />
          </div>
          <h3 className="font-bold text-lg">50:50 $META Stock Split</h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            Future protocol upgrade splits staking rewards 50:50 between $PONS and tokenized $META equity on Robinhood Chain.
          </p>
        </div>
      </section>
    </div>
  );
}
