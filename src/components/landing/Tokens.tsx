import { ArrowRight } from "lucide-react";

import { Section, Reveal } from "./Section";
import { BRAND, rewardsCase } from "@/lib/brand";
import { PONS_TOKEN_ADDRESS } from "@/lib/config";

/* =====================================================================
   05 — Tokens.

   Golden split, flipped: the reward case takes the minor third and the
   argument takes the major. Two cards, not four — the earning asset and
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
    tone="paper"
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
          <div className="overflow-hidden rounded-[1.25rem] border-2 border-ink bg-sky-dark shadow-ink">
            <img
              src={rewardsCase}
              alt="A Monkii Labs reward case of minted coins beside a signed proof-of-life card"
              loading="lazy"
              className="block h-auto w-full"
              width={1280}
              height={853}
            />
          </div>
          <figcaption className="mt-fib2 text-label text-claw-gray-600">
            Proof of life in, rewards out. The pool wallet pays the network fee.
          </figcaption>
        </figure>
      </Reveal>

      {/* The two assets, in the major. */}
      <div className="grid gap-fib3">
        <Reveal delay={0.08}>
          <article className="ink-card p-fib4">
            <div className="flex flex-wrap items-baseline justify-between gap-fib2">
              <h3 className="font-display text-d2 text-ink">{BRAND.rewardToken}</h3>
              <span className="label-mono text-claw-gray-600">Earning token</span>
            </div>
            <p className="mt-fib2 max-w-[60ch] text-body text-claw-gray-600">
              The receipt for verified compute. It cannot be bought — the only way to hold
              it is to have done the work — and it is the asset you stake.
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.14}>
          <article className="ink-card p-fib4">
            <div className="flex flex-wrap items-baseline justify-between gap-fib2">
              <h3 className="font-display text-d2 text-coral">{BRAND.valueToken}</h3>
              <span className="label-mono text-claw-gray-600">Value capture · live</span>
            </div>
            <p className="mt-fib2 max-w-[60ch] text-body text-claw-gray-600">
              The launchpad token on {BRAND.network}, with its own liquidity and burn
              mechanics. Distributed to stakers each 24-hour epoch from the platform
              reserve.
            </p>

            <div className="mt-fib3 rounded-xl border-2 border-ink bg-cream p-fib3">
              <div className="label-mono text-claw-gray-600">Phase 2 · 50:50 split</div>
              <p className="mt-fib1 max-w-[58ch] text-label text-claw-gray-600">
                Rewards move to half {BRAND.valueToken} and half tokenized{" "}
                {BRAND.stockToken} stock — real equity exposure, settled on the same chain,
                on the same epoch schedule.
              </p>
            </div>

            <p className="mt-fib3 break-all rounded-lg border-2 border-ink/15 bg-muted px-fib2 py-fib2 font-mono text-[0.6875rem] leading-relaxed tracking-normal text-claw-gray-900">
              {PONS_TOKEN_ADDRESS}
            </p>
          </article>
        </Reveal>
      </div>
    </div>

    {/* The loop, restated as a rail. Last item is the payoff, so it is
        the only one that carries colour. */}
    <Reveal delay={0.2}>
      <div className="mt-fib5 border-t-2 border-ink/20 pt-fib4">
        <h3 className="label-mono text-claw-gray-600">The sustainable loop</h3>
        <ol className="mt-fib3 flex flex-wrap items-center gap-fib2">
          {FLOW.map((step, i) => (
            <li key={step} className="flex items-center gap-fib2">
              <span
                className={`rounded-full border-2 border-ink px-fib3 py-1.5 font-mono text-label font-semibold ${
                  i === FLOW.length - 1 ? "bg-vital text-ink" : "bg-white text-ink"
                }`}
              >
                {step}
              </span>
              {i < FLOW.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-coral" strokeWidth={2.5} />
              )}
            </li>
          ))}
        </ol>
        <p className="mt-fib3 max-w-[72ch] text-label text-claw-gray-600">
          Revenue sources — LP and trading fees, developer fees, premium features,
          Companion mints and royalties — fund open-market buybacks into the pool wallet.
          The fee ledger reports honest zeros until a source is actually live.
        </p>
      </div>
    </Reveal>
  </Section>
);

export default Tokens;
