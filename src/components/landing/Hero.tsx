import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { BRAND, monkiiBanner, monkiiLogo } from "@/lib/brand";

const CONTRACT_ADDRESS = "0xcd8d68414da15e9eec53a888878957fc008aa226";
const CONTRACT_SHORT = `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`;

const FloatingCloud = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    className={`absolute bg-white/80 rounded-full blur-sm ${className}`}
    animate={{ x: [0, 20, 0], y: [0, -15, 0], opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

/**
 * Contract address pill.
 *
 * The full address is 42 characters, which overflows a phone at the size the
 * rest of the hero is set in, so the short form carries small screens and the
 * full one appears from md up. Either way the copy button puts the complete
 * address on the clipboard.
 */
const ContractBubble = () => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // The clipboard API is unavailable over plain http and inside some
      // in-app wallet browsers. The address stays on screen and selectable,
      // so the fallback is to leave the label alone rather than claim a copy
      // that did not happen.
    }
  };

  return (
    <motion.button
      type="button"
      onClick={copy}
      aria-label={`Copy the ${BRAND.rewardToken} contract address ${CONTRACT_ADDRESS}`}
      className="group mb-8 sm:mb-12 flex max-w-full items-center gap-2 sm:gap-3 rounded-full border-2 border-sky/40 bg-white/80 px-3 py-2 sm:px-5 sm:py-2.5 shadow-playful backdrop-blur transition-colors duration-300 hover:border-sky hover:bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.65 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="shrink-0 rounded-full bg-coral px-2 py-0.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wide text-white">
        {BRAND.rewardToken}
      </span>
      <span className="truncate font-mono text-xs sm:text-sm font-bold text-claw-charcoal">
        <span className="md:hidden">{CONTRACT_SHORT}</span>
        <span className="hidden md:inline">{CONTRACT_ADDRESS}</span>
      </span>
      <span className="shrink-0 text-sky-dark" aria-hidden="true">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 opacity-60 group-hover:opacity-100" />}
      </span>
      <span className="sr-only" role="status">{copied ? `${BRAND.rewardToken} contract address copied` : ""}</span>
    </motion.button>
  );
};

const Hero = () => {
  return (
    <main className="z-40 flex flex-col mt-2 sm:mt-8 md:mt-12 px-4 relative items-center justify-start sm:justify-center pb-4 sm:pb-16 overflow-hidden">
      <FloatingCloud className="top-10 left-10 w-24 h-12 hidden sm:block" delay={0} />
      <FloatingCloud className="top-20 right-20 w-32 h-16 hidden sm:block" delay={1} />
      <FloatingCloud className="top-40 left-1/4 w-20 h-10 hidden md:block" delay={2} />
      <FloatingCloud className="top-32 right-1/3 w-28 h-14 hidden md:block" delay={1.5} />

      <motion.div
        className="mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-coral text-white rounded-full text-xs sm:text-sm font-bold shadow-coral"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        🐒 The Agentic Tamagotchi on Robinhood
      </motion.div>

      <motion.img
        src={monkiiLogo}
        alt="MONKII LABS mascot"
        className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl sm:rounded-3xl shadow-playful-lg mb-4 sm:mb-6"
        initial={{ scale: 0, y: -100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
        whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1, transition: { duration: 0.5 } }}
      />

      <motion.h1
        className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-center mb-3 sm:mb-4 leading-tight max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <span className="text-coral inline-block">{BRAND.first}</span>{" "}
        <span className="text-claw-charcoal inline-block">{BRAND.second}</span>
      </motion.h1>

      <motion.p
        className="text-base sm:text-lg md:text-2xl text-claw-charcoal max-w-2xl text-center mb-2 leading-relaxed font-bold px-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Keep{" "}
        <motion.span
          className="text-sky-dark inline-block"
          animate={{ color: ["hsl(199, 89%, 45%)", "hsl(263, 70%, 55%)", "hsl(199, 89%, 45%)"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          AI agents
        </motion.span>{" "}
        alive with{" "}
        <motion.span
          className="text-coral inline-block"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          community compute
        </motion.span>
      </motion.p>

      <motion.p
        className="text-sm sm:text-base md:text-lg text-claw-gray-600 max-w-xl text-center mb-6 sm:mb-8 leading-relaxed px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        Start a Proof-of-Life heartbeat in your browser, raise an agent's power level, and earn
        {" "}{BRAND.rewardToken}. Stake it to earn {BRAND.valueToken} on a fixed, transparent schedule.
        No hardware. No gas. No smart contracts in the core loop.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6 w-full sm:w-auto px-4 sm:px-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-coral hover:bg-coral-dark text-white rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-bold shadow-coral transition-all duration-300"
            asChild
          >
            <Link to="/dashboard">🐒 Start Nurturing</Link>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-bold border-2 border-sky bg-sky/10 text-sky-dark hover:bg-sky hover:text-white transition-all duration-300"
            asChild
          >
            <Link to="/dashboard/agents">📡 Browse Agents</Link>
          </Button>
        </motion.div>
      </motion.div>

      <ContractBubble />

      <motion.div
        className="w-full max-w-lg mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-playful-lg"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      >
        <img
          src={monkiiBanner}
          alt="MONKII LABS — nurturing AI agents on Robinhood with companions, proof of life and rewards"
          className="w-full h-auto"
        />
      </motion.div>

      <motion.div
        className="mt-8 sm:mt-12 flex-col items-center text-claw-gray-600 hidden sm:flex"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-sm font-medium mb-2">Scroll to explore</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </main>
  );
};

export default Hero;
