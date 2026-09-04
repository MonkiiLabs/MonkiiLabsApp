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
 * The strip between the hero instrument and the argument. It reads as
 * equipment labelling on the front of a rack: one step darker than the
 * bench, hairlines top and bottom, telemetry set in mono. The separator
 * between items is a green tick, because each item is a fact the network
 * is currently reporting.
 */
const Ticker = () => (
  <div className="relative overflow-hidden border-y border-hair/[0.07] bg-bench-2 py-fib2">
    <div className="flex w-max animate-marquee">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
          {ITEMS.map((item) => (
            <span key={item} className="flex shrink-0 items-center">
              <span className="label-mono px-fib4 text-paper-3">{item}</span>
              <span className="h-1 w-1 rounded-full bg-alive/70" />
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Ticker;
