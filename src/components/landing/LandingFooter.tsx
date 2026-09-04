import { Link } from "react-router-dom";
import { Twitter } from "lucide-react";

import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/components/landing/Section";

/* =====================================================================
   Footer.

   Charcoal, because the page has spent its whole length inside a
   charcoal keyline and this is the bottom edge of it. The wordmark
   holds the left major third; the three link columns share the minor.
   ===================================================================== */

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
  <footer className="border-t-2 border-ink bg-ink text-bone">
    <div className="mx-auto w-full max-w-6xl px-fib3 py-fib6 sm:px-fib4">
      <div className="grid gap-fib5 lg:grid-cols-golden lg:gap-fib6">
        <div>
          <Wordmark size="md" tone="bone" />
          <p className="mt-fib3 max-w-[46ch] text-label leading-relaxed text-bone-2">
            {BRAND.name} makes the unglamorous work of keeping AI agents alive into
            something a community can do together — on {BRAND.network}, one heartbeat at a
            time.
          </p>
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-fib3 inline-flex items-center gap-2 rounded-full border border-bone-3 px-fib3 py-1.5 label-mono text-bone-2 transition-colors duration-150 hover:border-vital hover:text-vital"
          >
            <Twitter className="h-3.5 w-3.5" strokeWidth={2} />
            Follow
          </a>
        </div>

        <div className="grid grid-cols-2 gap-fib4 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="label-mono text-bone-3">{col.heading}</h3>
              <ul className="mt-fib3 space-y-fib2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-label text-bone-2 transition-colors duration-150 hover:text-vital"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-fib5 flex flex-col gap-fib2 border-t border-bone-3/30 pt-fib3 sm:flex-row sm:items-center sm:justify-between">
        <p className="label-mono text-bone-3">
          © {new Date().getFullYear()} {BRAND.name} · {BRAND.network}
        </p>
        <p className="max-w-[62ch] text-micro leading-relaxed tracking-normal text-bone-3">
          {BRAND.rewardToken} is a utility compute receipt, not a security or an investment.
          Tokenized stock rewards are subject to regional eligibility.
        </p>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
