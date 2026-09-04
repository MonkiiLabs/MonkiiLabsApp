import { BRAND } from "@/lib/brand";

const ITEMS = [
  "Proof-of-Life v1",
  `${BRAND.network}`,
  "100ms finality",
  `${BRAND.rewardToken} · compute receipt`,
  `${BRAND.valueToken} · value capture`,
  `${BRAND.stockToken} · phase 2 split`,
  "Gasless nurturing",
  "Companion collectibles",
];

/**
 * A charcoal rule between the sky and the paper. It does one job — it
 * closes the hero with a hard edge, the way an ink outline closes a
 * shape in the source art — and carries the network facts while it does.
 */
const Ticker = () => (
  <div className="relative overflow-hidden border-y-2 border-ink bg-ink py-fib2">
    <div className="flex w-max animate-marquee">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
          {ITEMS.map((item) => (
            <span key={item} className="flex shrink-0 items-center">
              <span className="label-mono px-fib4 text-cream">{item}</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-vital" />
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Ticker;
