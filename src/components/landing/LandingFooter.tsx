import { Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BRAND, monkiiLogo } from "@/lib/brand";

const COLUMNS = [
  { heading: "Company", links: [{ label: "About", to: "/about" }] },
  {
    heading: "Support",
    links: [
      { label: "Help", to: "/help" },
      { label: "Accessibility", to: "/accessibility" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", to: "/terms" },
      { label: "Privacy", to: "/privacy" },
    ],
  },
];

const LandingFooter = () => (
  <footer className="overflow-hidden text-base text-claw-charcoal bg-cream w-full border-t-2 border-dashboard-border pt-20 md:pt-24">
    <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-28">
      <div className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-12">
        <div className="shrink-0 max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <img src={monkiiLogo} alt="" className="w-12 h-12 rounded-xl shadow-sm" />
            <span className="font-extrabold text-xl">
              <span className="text-coral">{BRAND.first}</span>
              <span className="text-claw-charcoal"> {BRAND.second}</span>
            </span>
          </div>
          <p className="text-sm text-claw-gray-600 leading-relaxed font-medium">
            {BRAND.name} reframes the unglamorous necessity of keeping AI agents alive as an
            engaging, community-driven, and rewarding experience on Robinhood. 🐒
          </p>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-24 lg:gap-32 w-full md:w-auto">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4 min-w-[120px]">
              <h3 className="text-xs font-bold text-claw-gray-600 mb-1 uppercase tracking-wider">
                {col.heading}
              </h3>
              {col.links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm font-medium text-claw-charcoal hover:text-coral transition-colors duration-200"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="w-full flex justify-center items-end leading-none select-none pointer-events-none overflow-hidden pb-8 md:pb-0">
      <motion.h2
        className="text-[15vw] font-extrabold tracking-tighter text-coral/10 whitespace-nowrap translate-y-[8%] md:translate-y-[12%]"
        animate={{ x: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        MONKII LABS 🐒
      </motion.h2>
    </div>

    <div className="w-full border-t-2 border-dashboard-border bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-10 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
        <div className="text-xs order-2 md:order-1 font-medium text-claw-gray-600 tracking-tight">
          © 2026 {BRAND.name}. Nurturing AI agents on Robinhood. 🐒
        </div>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          aria-label="MONKII LABS on X"
          className="order-1 md:order-2 w-10 h-10 rounded-full bg-cream border-2 border-dashboard-border flex items-center justify-center text-claw-gray-600 hover:bg-coral hover:text-white hover:border-coral transition-all duration-200"
        >
          <Twitter className="w-4 h-4" />
        </a>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
