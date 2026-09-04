import { ArrowRight } from "lucide-react";

import { Section, Reveal } from "./Section";
import { BRAND, rewardsCase } from "@/lib/brand";
import { PONS_TOKEN_ADDRESS } from "@/lib/config";

/* =====================================================================
   05. Tokens.

   Golden split, flipped: the reward case takes the minor third and the
   argument takes the major. Two cards, not four, the earning asset and
   the value-capture asset are the whole story, and the phase-2 equity
   split is a footnote on the second one rather than a third column
   competing for attention.
   ===================================================================== */

const FLOW = [
  "Nurture",
  `${BRAND.rewardToken} earned`,
  "Staked",
  "24h epoch",
  `${BRAND.valueToken} + ${BRAND.stockToken}`,
];

const Tokens = () => (
  <Section
    id="tokens"
    index="05"
    eyebrow="Tokens"
    tone="bench"
    title={
      <>
        One earns the work.
        <br className="hidden sm:block" /> The other holds value.
      </>
    }
    intro={
      <>
        Neither is issued for holding or trading in isolation. Both come out of
        participation that can be checked.
      </>
    }
  >
    <div className="grid gap-fib5 lg:grid-cols-golden-flip lg:items-start lg:gap-fib6">
      {/* The case, in the minor third. */}
      <Reveal>
        <figure className="lg:sticky lg:top-fib6">
          <div className="overflow-hidden rounded-xl border border-hair/10 bg-bench-2">
            <img
              src={rewardsCase}
              alt="A Monkii Labs reward case of minted coins beside a signed proof-of-life card"
              loading="lazy"
              className="block h-auto w-full"
              width={1280}
              height={853}
            />
          </div>
          <figcaption className="mt-fib2 text-label text-paper-3">
            Proof of life in, rewards out. The pool wallet pays the network fee.
          </figcaption>
        </figure>
      </Reveal>

      {/* The two assets, in the major. */}
      <div className="grid gap-fib3">
        <Reveal delay={0.08}>
          <article className="panel p-fib4">
            <div className="flex flex-wrap items-baseline justify-between gap-fib2">
              <h3 className="font-display text-d2 text-brass">{BRAND.rewardToken}</h3>
              <span className="label-mono text-paper-3">Earning token</span>
            </div>
            <p className="mt-fib2 max-w-[60ch] text-body text-paper-2">
              The receipt for verified compute. It cannot be bought. The only way to hold
              it is to have done the work, and it is the asset you stake.
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.14}>
          <article className="panel p-fib4">
            <div className="flex flex-wrap items-baseline justify-between gap-fib2">
              <h3 className="font-display text-d2 text-act-lit">{BRAND.valueToken}</h3>
              <span className="label-mono text-paper-3">Value capture · live</span>
            </div>
            <p className="mt-fib2 max-w-[60ch] text-body text-paper-2">
              The launchpad token on {BRAND.network}, with its own liquidity and burn
              mechanics. Distributed to stakers each 24-hour epoch from the platform
              reserve.
            </p>

            <div className="well mt-fib3 p-fib3">
              <div className="label-mono text-paper-3">Phase 2 · 50:50 split</div>
              <p className="mt-fib1 max-w-[58ch] text-label text-paper-2">
                Rewards move to half {BRAND.valueToken} and half tokenized{" "}
                {BRAND.stockToken} stock: real equity exposure, settled on the same chain,
                on the same epoch schedule.
              </p>
            </div>

            <p className="well mt-fib3 break-all px-fib2 py-fib2 font-mono text-[0.6875rem] leading-relaxed tracking-normal text-paper-2">
              {PONS_TOKEN_ADDRESS}
            </p>
          </article>
        </Reveal>
      </div>
    </div>

    {/* The loop, restated as a rail. Last item is the payoff, so it is
        the only one that carries colour. */}
    <Reveal delay={0.2}>
      <div className="mt-fib5 border-t border-hair/10 pt-fib4">
        <h3 className="label-mono text-paper-3">The sustainable loop</h3>
        <ol className="mt-fib3 flex flex-wrap items-center gap-fib2">
          {FLOW.map((step, i) => (
            <li key={step} className="flex items-center gap-fib2">
              <span
                className={`rounded-sm border px-fib3 py-1.5 font-mono text-micro font-semibold uppercase ${
                  i === FLOW.length - 1
                    ? "border-alive/35 bg-alive/12 text-alive-lit"
                    : "border-hair/12 bg-hair/[0.04] text-paper-2"
                }`}
              >
                {step}
              </span>
              {i < FLOW.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-paper-4" strokeWidth={2} />
              )}
            </li>
          ))}
        </ol>
        <p className="mt-fib3 max-w-[72ch] text-label text-paper-2">
          Revenue sources (LP and trading fees, developer fees, premium features,
          Companion mints and royalties) fund open-market buybacks into the pool wallet.
          The fee ledger reports honest zeros until a source is actually live.
        </p>
      </div>
    </Reveal>
  </Section>
);

export default Tokens;
