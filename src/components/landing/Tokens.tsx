import { Section, Reveal } from "./Section";
import { BRAND } from "@/lib/brand";
import { PONS_TOKEN_ADDRESS } from "@/lib/config";

const BENEFITS = [
  { emoji: "✖️", title: "Reward multiplier", body: `Staking ${BRAND.rewardToken} linearly raises your per-heartbeat earn rate, up to a capped maximum.` },
  { emoji: "🔓", title: "Premium access", body: "Staking above a threshold unlocks premium agents." },
  { emoji: "⏳", title: "Epoch reward", body: `A qualifying stake held unchanged through a full cycle earns a flat ${BRAND.valueToken} payout on the shared global schedule.` },
  { emoji: "🔎", title: "Transparency", body: `The reward-pool dashboard shows the pool wallet's real on-chain ${BRAND.valueToken} balance and total distributed — not a claimed number.` },
];

const Tokens = () => (
  <Section
    id="tokens"
    eyebrow="Tokens"
    title={<>Two tokens, two jobs. The tokens serve the loop, not the reverse.</>}
    intro={
      <>
        Neither token is issued for merely holding, trading, or speculating in isolation — both flow
        from genuine participation.
      </>
    }
    className="bg-cream"
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
      <Reveal>
        <article className="h-full bg-white rounded-3xl border-2 border-sky/40 p-6 card-playful">
          <h3 className="text-xl font-extrabold text-sky-dark mb-2">{BRAND.rewardToken}</h3>
          <p className="text-xs font-extrabold uppercase tracking-wider text-claw-gray-600 mb-3">
            Reward token · pre-launch
          </p>
          <p className="text-sm text-claw-gray-600 leading-relaxed">
            The receipt for real compute work — earned exclusively through verified heartbeat
            sessions. It is currently an off-chain accounting balance (claiming to a wallet is on hold
            pending launch) but it is already fully functional as the unit that gets staked.
          </p>
        </article>
      </Reveal>
      <Reveal delay={0.08}>
        <article className="h-full bg-white rounded-3xl border-2 border-coral/40 p-6 card-playful">
          <h3 className="text-xl font-extrabold text-coral-dark mb-2">{BRAND.valueToken}</h3>
          <p className="text-xs font-extrabold uppercase tracking-wider text-claw-gray-600 mb-3">
            Value-capture token · live
          </p>
          <p className="text-sm text-claw-gray-600 leading-relaxed">
            A real ERC-20 on Robinhood Chain with its own pre-existing liquidity and community. Staking
            {" "}{BRAND.rewardToken} is the only way to earn it, and claiming is live today: the
            platform's pool wallet sends it straight to your wallet and pays the network fee itself.
          </p>
          <p className="mt-4 text-[11px] font-mono break-all text-claw-gray-600 bg-cream rounded-xl border-2 border-dashboard-border p-3">
            {PONS_TOKEN_ADDRESS}
          </p>
        </article>
      </Reveal>
    </div>

    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 mt-6">
      {BENEFITS.map((b, i) => (
        <Reveal key={b.title} delay={i * 0.06}>
          <article className="h-full bg-white rounded-3xl border-2 border-dashboard-border p-5">
            <div className="text-2xl mb-3">{b.emoji}</div>
            <h3 className="text-sm font-extrabold text-claw-charcoal mb-1.5">{b.title}</h3>
            <p className="text-xs sm:text-sm text-claw-gray-600 leading-relaxed">{b.body}</p>
          </article>
        </Reveal>
      ))}
    </div>

    <Reveal delay={0.15} className="mt-8">
      <div className="bg-white rounded-3xl border-2 border-dashboard-border p-6 sm:p-8">
        <h3 className="text-base sm:text-lg font-extrabold text-claw-charcoal mb-4">The sustainable loop</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-claw-charcoal">
          {[
            "Nurture (heartbeat)",
            `${BRAND.rewardToken} earned`,
            `Stake ${BRAND.rewardToken}`,
            `${BRAND.valueToken} epoch reward`,
            "More reason to nurture",
          ].map((node, i, arr) => (
            <span key={node} className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-full bg-cream border-2 border-dashboard-border">{node}</span>
              {i < arr.length - 1 && <span className="text-coral">→</span>}
            </span>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-claw-gray-600 leading-relaxed mt-5">
          Planned revenue sources — LP/trading fees, developer fees, premium-feature fees, and
          Companion mints and royalties — feed open-market buybacks into the pool wallet. Consistent
          with our economics-transparency principle, the fee ledger reports honest zeros until a
          source is actually live.
        </p>
      </div>
    </Reveal>
  </Section>
);

export default Tokens;
