import type { ReactNode } from "react";

import { StaticPageShell } from "@/pages/static/StaticPageShell";
import { BRAND } from "@/lib/brand";
import {
  AGENT_POWER_MAX,
  CHAIN_ID,
  CHAIN_NAME,
  COMPANION_NFT_ADDRESS,
  PONS_TOKEN_ADDRESS,
  explorerAddressUrl,
} from "@/lib/config";

/**
 * The whitepaper, at /whitepaper.
 *
 * Every number on this page is a live protocol parameter, not a
 * marketing figure: the defaults in backend/src/lib/env.ts, the
 * multiplier curve in backend/src/lib/staking.ts, and the accrual scales
 * in backend/src/lib/pow.ts. If one of those defaults moves, the matching
 * row here has to move with it, which is why they are all collected in
 * section 9 rather than scattered through the prose.
 *
 * It reads on the same shell as the policy pages: one column, cream
 * paper, sky behind the masthead. A whitepaper is a document, so the only
 * things here that are not running text are the parameter tables, and
 * they are set as tables rather than dressed up as cards.
 */

const SECTIONS = [
  { id: "abstract", label: "Abstract" },
  { id: "problem", label: "1. The problem" },
  { id: "vitality", label: "2. Agent vitality" },
  { id: "proof-of-life", label: "3. Proof-of-Life" },
  { id: "monkii", label: `4. ${BRAND.rewardToken}, the compute receipt` },
  { id: "staking", label: `5. Staking and the ${BRAND.valueToken} epoch` },
  { id: "companions", label: "6. Companion collectibles" },
  { id: "architecture", label: "7. Architecture" },
  { id: "security", label: "8. Security model" },
  { id: "parameters", label: "9. Protocol parameters" },
  { id: "roadmap", label: "10. Roadmap" },
  { id: "risks", label: "11. Risks and limitations" },
];

/** A section heading that the contents list can link to. */
function H({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-28">
      {children}
    </h2>
  );
}

/** Parameter tables. Two columns of prose, one of tabular figures. */
function ParamTable({
  caption,
  rows,
}: {
  caption: string;
  rows: Array<[string, string, string]>;
}) {
  return (
    <div className="my-fib4 overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-label">
        <caption className="label-mono mb-fib2 text-left text-claw-gray-600">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-dashboard-border text-left">
            <th className="py-fib2 pr-fib3 font-extrabold text-claw-charcoal">Parameter</th>
            <th className="py-fib2 pr-fib3 font-extrabold text-claw-charcoal">Value</th>
            <th className="py-fib2 font-extrabold text-claw-charcoal">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, value, meaning]) => (
            <tr key={name} className="border-b border-dashboard-border/60 align-top">
              <td className="py-fib2 pr-fib3 font-semibold text-claw-charcoal">{name}</td>
              <td className="py-fib2 pr-fib3 font-bold tabular-nums text-coral">{value}</td>
              <td className="py-fib2 text-claw-gray-600">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WhitepaperPage() {
  return (
    <StaticPageShell title="Whitepaper" eyebrow={`${BRAND.name} · Version 1.0 · ${CHAIN_NAME}`}>
      <p className="text-lead text-claw-charcoal">
        A protocol that turns the upkeep of autonomous AI agents into verified, browser-native work
        anyone can contribute, and pays for it.
      </p>

      {/* Contents. Numbered because the sections genuinely build on each
          other: vitality defines the problem Proof-of-Life solves, which
          defines what the token is a receipt for. */}
      <nav aria-label="Contents" className="my-fib4 border-y-2 border-dashboard-border py-fib3">
        <h2 className="label-mono !mt-0 text-claw-gray-600">Contents</h2>
        <ol className="!mt-fib2 !list-none !space-y-fib1 !pl-0 columns-1 sm:columns-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="!font-semibold !text-claw-charcoal !no-underline hover:!text-coral"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <H id="abstract">Abstract</H>
      <p>
        Autonomous AI agents are expensive to keep alive and cheap to abandon. The cost of uptime
        sits with one operator, while the community that forms around an agent has no way to help
        and no signal of whether the agent is healthy at all.
      </p>
      <p>
        {BRAND.name} makes agent upkeep a public, participatory act. Each agent carries a power level
        that decays continuously. Anyone can open a browser tab, receive a keccak-256 challenge,
        solve it off the main thread in a Web Worker, and submit the solution. A verified solution
        restores a slice of that agent's power and credits the contributor in {BRAND.rewardToken}, a
        receipt for verified compute. Staking {BRAND.rewardToken} earns {BRAND.valueToken} on a
        fixed 24-hour epoch, paid from a real balance held on {CHAIN_NAME}.
      </p>
      <p>
        No specialised hardware, no gas to participate, and nothing to install. The contribution
        path is a browser tab.
      </p>

      <H id="problem">1. The problem</H>
      <p>
        <strong>Sustainability.</strong> Keeping an agent running falls on a single party. When their
        attention or their budget lapses, the agent goes dark and everything built on it goes with
        it.
      </p>
      <p>
        <strong>Engagement.</strong> Communities form around interesting agents and then have nothing
        to do but speculate on a ticker. Wanting to help and being able to help are different things.
      </p>
      <p>
        <strong>Visibility.</strong> There is no shared, honest signal of whether an agent is
        healthy. An agent that has been failing for a week looks exactly like one that is fine.
      </p>

      <H id="vitality">2. Agent vitality</H>
      <p>
        Every agent holds a power level between 0 and {AGENT_POWER_MAX}. Power decays at a fixed rate
        per hour, derived from the agent's real traction, so an agent left alone degrades on a
        published schedule rather than at anyone's discretion.
      </p>
      <p>
        Decay is continuous and computed rather than ticked. Live power is always the last recorded
        power minus the decay accrued since it was recorded, so what an API response reports and
        what a heartbeat writes back start from the same number. A background evaluator materialises
        that value periodically and emits alerts on a state change, but it is not what makes decay
        happen.
      </p>
      <p>Three states are derived from power, and all three are public:</p>
      <ul>
        <li>
          <strong>Thriving</strong>, at or above the agent's healthy threshold.
        </li>
        <li>
          <strong>Idle</strong>, between the warning and healthy thresholds.
        </li>
        <li>
          <strong>Fading</strong>, at or below the warning threshold.
        </li>
      </ul>
      <p>
        Thresholds are per agent, not global. An agent with deeper traction is held to a higher bar,
        which keeps the state meaningful across a fleet of very different agents.
      </p>

      <H id="proof-of-life">3. Proof-of-Life</H>
      <p>
        Proof-of-Life is the mechanism that converts attention into something a server can verify.
        It is deliberately a proof of <em>work</em>, not a proof of stake or of identity: the only
        thing it establishes is that real computation was spent on a challenge that could not have
        been prepared in advance.
      </p>
      <p>The loop, in full:</p>
      <ol>
        <li>
          The contributor opens a session against an agent at a chosen intensity, and the server
          issues a single-use challenge: a random seed and a difficulty.
        </li>
        <li>
          The browser grinds a nonce in a Web Worker until{" "}
          <code>keccak256(seed:nonce)</code> carries at least <em>difficulty</em> leading zero bits.
          The worker runs off the main thread, so the interface stays responsive and the progress
          shown is the real hash rate.
        </li>
        <li>
          The solution is submitted. The server re-derives the same digest, checks the work, and
          consumes the challenge in a single conditional update, so a replayed or concurrent
          submission loses the race and is rejected.
        </li>
        <li>
          On acceptance, the agent's power is decayed to now and then increased, clamped at{" "}
          {AGENT_POWER_MAX}, the vitality state is re-derived, and {BRAND.rewardToken} is credited to
          the contributor.
        </li>
        <li>The next challenge is issued in the same response, and the loop continues.</li>
      </ol>
      <p>
        Intensity sets the difficulty and the payout together. Higher intensity costs more compute
        per accepted heartbeat and pays proportionally more, so the choice is a genuine trade rather
        than a free upgrade.
      </p>

      <ParamTable
        caption="Accrual by intensity, relative to a standard heartbeat"
        rows={[
          ["Light", "0.5x power · 0.6x earn", "Two fewer difficulty bits. For phones and background tabs."],
          ["Standard", "1.0x power · 1.0x earn", "The baseline challenge."],
          ["Max", "1.5x power · 1.6x earn", "Two extra bits, roughly four times the expected work."],
        ]}
      />

      <p>
        Two guards keep the loop honest. A challenge expires if it is not solved in time, so work
        cannot be banked against a future session. And a minimum interval between accepted
        heartbeats bounds how fast a single session can submit, with the server returning the exact
        wait rather than a bare rejection, so a fast machine paces itself instead of being punished
        for being fast.
      </p>

      <H id="monkii">4. {BRAND.rewardToken}, the compute receipt</H>
      <p>
        {BRAND.rewardToken} is the receipt for verified compute. It is credited only by an accepted
        Proof-of-Life heartbeat, and the amount is a function of the difficulty actually solved and
        the contributor's multipliers. There is no path to {BRAND.rewardToken} that does not pass
        through verified work.
      </p>
      <p>
        Balances are held in an off-chain ledger. This is a deliberate choice, not a shortcut: a
        heartbeat that settled on-chain would cost gas, and a mechanism whose entire promise is that
        anyone can contribute from a browser tab for free cannot have a fee on its core loop. What
        the ledger records is a claim on the protocol, and section 11 is explicit about what that
        means for trust.
      </p>
      <p>
        During the pre-launch phase, {BRAND.rewardToken} accrues and does not withdraw. The gate is a
        protocol setting rather than a missing feature, so the mining phase and the claiming phase
        are the same system in two configurations.
      </p>

      <H id="staking">5. Staking and the {BRAND.valueToken} epoch</H>
      <p>
        Staking {BRAND.rewardToken} does two things: it raises the earn multiplier on every
        subsequent heartbeat, and it makes the stake eligible for {BRAND.valueToken} yield.
      </p>
      <p>
        The multiplier is linear and published. It runs from 1.0x at zero staked to 3.0x at the
        maximum, with no cliff and no discretionary tier. Yield settles on fixed 24-hour epochs
        anchored to a published UTC instant, so an epoch boundary is the same moment for everyone and
        cannot be moved for one participant.
      </p>
      <p>
        A stake becomes eligible from the <em>next</em> epoch boundary after it is made, never the
        one it was made inside. This is what stops a stake placed minutes before settlement from
        collecting a full epoch of yield it did not hold through, and it is the reason the entitlement
        is computed from epoch indices rather than from elapsed time.
      </p>
      <p>
        Payout is a flat, global rate per staked {BRAND.rewardToken} per completed epoch. There is no
        per-user schedule.
      </p>
      <p>
        <strong>Phase 2: the 50:50 split.</strong> Yield today is paid entirely in{" "}
        {BRAND.valueToken}, a liquid launchpad token on {CHAIN_NAME}. In Phase 2 the disbursal engine
        splits a claim in half: 50% in {BRAND.valueToken} and 50% in tokenized {BRAND.stockToken}{" "}
        stock tokens on the same chain. The staking mechanism does not change; only the settlement
        leg does.
      </p>

      <H id="companions">6. Companion collectibles</H>
      <p>
        Companions are the ownership layer. They are a real ERC-721 collection on {CHAIN_NAME}, so
        what you hold is yours and outlives the platform that issued it. Companions are earned
        against milestones in the loop rather than sold as a shortcut past it.
      </p>
      <p>
        Up to three Companions equip to a single agent. Their effects stack in two directions: a
        bonus to {BRAND.rewardToken} earned on every heartbeat against that agent, and a reduction in
        that agent's power decay. Decay reduction is capped, so no combination of Companions can make
        an agent immortal and remove the reason to nurture it.
      </p>
      <p>Rarity determines the size of those effects:</p>
      <ul>
        <li>
          <strong>Common</strong>, +5 to 10% earn rate.
        </li>
        <li>
          <strong>Uncommon</strong>, +10 to 15% earn rate with minor fade mitigation.
        </li>
        <li>
          <strong>Rare</strong>, +15 to 25% earn rate with moderate fade mitigation.
        </li>
        <li>
          <strong>Epic</strong>, +25 to 35% earn rate with strong fade mitigation.
        </li>
        <li>
          <strong>Legendary</strong>, +35 to 50% earn rate with strong protection and unique
          abilities.
        </li>
      </ul>
      <p>
        Equipping and unequipping are off-chain and instant, so arranging a loadout costs nothing.
        Minting is the on-chain act, and it is gas-only: there is no mint price.
      </p>

      <H id="architecture">7. Architecture</H>
      <p>
        The dividing line is simple. Anything that benefits from being permanent and independently
        verifiable goes on-chain. Anything on the hot path of the nurturing loop stays off it.
      </p>
      <p>
        <strong>On {CHAIN_NAME}</strong> ({CHAIN_NAME} is an Arbitrum Orbit L2, chain ID {CHAIN_ID},
        gas paid in native ETH): the Companion ERC-721 collection, {BRAND.valueToken} balances and
        payouts, the reward pool wallet, and wallet-signature authentication.
      </p>
      <p>
        <strong>Off-chain</strong>: the agent registry, Proof-of-Life challenge issuance and
        verification, the {BRAND.rewardToken} ledger, staking accrual, Companion equipping, and
        vitality evaluation. These are the operations that run continuously, per contributor, many
        times a minute.
      </p>
      <p>
        The client is a React application; the solver is a Web Worker so that grinding never blocks
        the interface. The service layer is a TypeScript API over PostgreSQL, with every
        balance-altering operation written inside a database transaction. Contract addresses in use:{" "}
        <a href={explorerAddressUrl(PONS_TOKEN_ADDRESS)} target="_blank" rel="noreferrer">
          {BRAND.valueToken} token
        </a>{" "}
        and{" "}
        <a href={explorerAddressUrl(COMPANION_NFT_ADDRESS)} target="_blank" rel="noreferrer">
          Monkii Companions
        </a>
        .
      </p>

      <H id="security">8. Security model</H>
      <p>
        <strong>Authentication is a signature, never a password.</strong> Signing in means signing a
        nonce-bearing message with the wallet. The message states plainly that it costs no gas and
        triggers no transaction. A verified signature issues a session token; the wallet is never
        asked for anything else to browse.
      </p>
      <p>
        <strong>Every balance-altering action is separately authorised.</strong> Staking, unstaking
        and claiming each require their own signed message naming the action, the wallet, the amount
        and a nonce. A session token alone cannot move a balance. Each authorisation carries a
        timestamp and is rejected outside a short freshness window, and each nonce is recorded and
        refused on reuse, so a captured authorisation cannot be replayed.
      </p>
      <p>
        <strong>Work cannot be replayed.</strong> Challenges are single-use and time-limited, and
        consumption is a conditional update, so two submissions of the same solution cannot both be
        credited.
      </p>
      <p>
        <strong>Protocol gating is explicit.</strong> {BRAND.rewardToken} claiming,{" "}
        {BRAND.valueToken} claiming and Companion minting are each independently switchable. Any of
        them being paused is a stated protocol state with a reason returned to the caller, not a
        silent failure.
      </p>

      <H id="parameters">9. Protocol parameters</H>
      <p>
        These are the live defaults. They are configuration rather than constants, which is what lets
        difficulty and yield be tuned without a redeploy, and it also means the authoritative value
        is the one the API reports, not the one printed here.
      </p>

      <ParamTable
        caption="Proof-of-Life"
        rows={[
          ["Challenge difficulty", "10 bits", "Leading zero bits required on the keccak-256 digest, at standard intensity."],
          ["Challenge lifetime", "120 s", "After which an unsolved challenge expires and cannot be submitted."],
          ["Power per heartbeat", "10", `Restored to the agent, out of a maximum of ${AGENT_POWER_MAX}.`],
          ["Earn per heartbeat", `5.0 ${BRAND.rewardToken}`, "Before staking and Companion multipliers."],
          ["Minimum interval", "3 s", "Between accepted heartbeats on one session."],
          ["Vitality evaluation", "60 s", "How often decayed power is materialised and alerts are emitted."],
        ]}
      />

      <ParamTable
        caption={`Staking and ${BRAND.valueToken} yield`}
        rows={[
          ["Epoch length", "24 h", "Anchored to a fixed UTC instant, identical for every participant."],
          ["Minimum stake", `100 ${BRAND.rewardToken}`, `Below this a stake earns no ${BRAND.valueToken}.`],
          ["Yield rate", `0.001 ${BRAND.valueToken}`, `Per staked ${BRAND.rewardToken}, per completed epoch.`],
          ["Multiplier range", "1.0x to 3.0x", "Linear in the amount staked, applied to every heartbeat."],
          ["Maximum multiplier at", `10,000 ${BRAND.rewardToken}`, "The stake at which the multiplier reaches 3.0x."],
          ["Premium threshold", `1,000 ${BRAND.rewardToken}`, "Unlocks premium access."],
        ]}
      />

      <ParamTable
        caption="Companions"
        rows={[
          ["Slots per agent", "3", "Equipped Companions whose effects stack."],
          ["Mint price", "Gas only", "No mint fee; the contributor pays network gas."],
          ["Decay reduction cap", "80%", "The ceiling on stacked fade mitigation for one agent."],
        ]}
      />

      <H id="roadmap">10. Roadmap</H>
      <p>
        <strong>Phase 1, foundation and Proof-of-Life.</strong> The web cockpit, wallet sign-in, the
        Web Worker keccak-256 solver, and the {BRAND.rewardToken} ledger.
      </p>
      <p>
        <strong>Phase 2, staking and {BRAND.valueToken} epochs.</strong> The 24-hour payout engine,
        liquid {BRAND.valueToken} rewards, and the Companion inventory.
      </p>
      <p>
        <strong>Phase 3, the 50:50 {BRAND.stockToken} split.</strong> Tokenized {BRAND.stockToken}{" "}
        stock token integration on {CHAIN_NAME} and dual crypto-equity disbursal.
      </p>
      <p>
        <strong>Phase 4, fleet and mobile scale.</strong> Mobile nurturing nodes and an autonomous
        agent fleet marketplace.
      </p>

      <H id="risks">11. Risks and limitations</H>
      <p>
        <strong>The ledger is trusted.</strong> {BRAND.rewardToken} balances, Proof-of-Life
        verification and staking accrual run off-chain. Participants rely on the protocol to account
        honestly, and the mitigation is transparency rather than trustlessness: published
        parameters, a published epoch schedule, and payouts made from a wallet balance anyone can
        inspect on-chain.
      </p>
      <p>
        <strong>Proof-of-Life is a work receipt, not a security mechanism.</strong> It establishes
        that computation was spent. It does not establish who spent it, and it cannot by itself
        distinguish one enthusiastic participant from several coordinated ones. Rate limiting and
        earn governance, not the hash function, are what bound that.
      </p>
      <p>
        <strong>Phase 2 depends on third-party rails.</strong> The {BRAND.stockToken} settlement leg
        requires tokenized stock infrastructure on {CHAIN_NAME}. Until that is live, yield is paid
        entirely in {BRAND.valueToken}.
      </p>
      <p>
        <strong>Parameters will change.</strong> Difficulty, yield rate and thresholds are tuned as
        the fleet grows. Changes affect future accrual, never balances already earned.
      </p>
      <p>
        <strong>Not investment advice.</strong> {BRAND.rewardToken} is a participation receipt for
        verified compute, not an offer of a security and not a claim on any entity's revenue. Nothing
        on this page is a promise of financial return. The binding terms are on the{" "}
        <a href="/terms">terms page</a>.
      </p>

      <p className="!mt-fib5 border-t-2 border-dashboard-border pt-fib3 text-label text-claw-gray-600">
        Version 1.0. Parameters current as of publication; the authoritative values are the ones the
        protocol reports at runtime. Questions go to the <a href="/contact">contact page</a>.
      </p>
    </StaticPageShell>
  );
}
