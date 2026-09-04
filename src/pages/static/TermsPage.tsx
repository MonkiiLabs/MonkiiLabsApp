import { StaticPageShell } from "@/pages/static/StaticPageShell";
import { BRAND } from "@/lib/brand";

export default function TermsPage() {
  return (
    <StaticPageShell title="Terms of Use" eyebrow="Legal">
      <p>
        These terms govern your use of {BRAND.name} and everything reachable from it: the web
        application, the Proof-of-Life compute loop, the staking and reward ledger, and the Companion
        NFT collection on {BRAND.network}. By connecting a wallet or running a heartbeat session you
        accept them. If you do not accept them, do not use the platform.
      </p>

      <h2>Who may use the platform</h2>
      <p>
        You must be old enough to enter a binding contract where you live, and you must not be
        located in, or acting on behalf of anyone in, a jurisdiction subject to comprehensive
        sanctions or otherwise barred from using services of this kind. You are responsible for
        knowing whether local law permits your use, and for any tax arising from your activity here.
      </p>

      <h2>Your wallet and your session</h2>
      <p>
        Your wallet is your account. We never hold your keys, your seed phrase, or your funds, and we
        will never ask you for them. Signing in means signing a plain-text message that proves you
        control an address; it costs no gas and authorises no transfer. Every action taken by an
        address is treated as taken by its owner, so keep your keys, your device, and your wallet
        software secure. We cannot reverse a transaction, recover a lost key, or restore access to a
        compromised wallet.
      </p>

      <h2>Proof-of-Life compute</h2>
      <p>
        A heartbeat session runs a hashing workload in your browser and submits solved challenges to
        our servers, which verify them and credit the result. You agree to run it only in a browser
        you control, and not to submit forged, replayed, pre-computed, or automated solutions, nor to
        operate multiple identities to inflate a single participant's share. We may rate-limit,
        suspend, or void the accrual of any session we determine is manipulating the loop, and we may
        change difficulty, session length, or accrual rates to keep it fair.
      </p>

      <h2>{BRAND.rewardToken}, {BRAND.valueToken}, and rewards</h2>
      <p>
        {BRAND.rewardToken} is an internal accounting balance recording verified compute work. It is
        not a security, not an investment, not a claim on the company or its revenue, and not a
        promise that any future token will be issued or that it will have value. {BRAND.valueToken}{" "}
        payouts are made from the balance actually held by the pool wallet, on the published epoch
        schedule; where that balance is insufficient, payouts are reduced or deferred accordingly.
        Reward rates, multipliers, thresholds, and the epoch schedule are parameters, and we may
        change them as the economy evolves. Nothing here is financial advice.
      </p>

      <h2>Companion NFTs</h2>
      <p>
        Companions are ERC-721 tokens on {BRAND.network}. Once minted they are yours: you own them,
        you may transfer or sell them, and that ownership does not depend on this platform continuing
        to exist. What we control is what a Companion does inside the product. Bonuses apply only
        while a Companion is equipped to an agent you are actively nurturing, and bonus values,
        slots, and effects are balance parameters we may tune. Owning a Companion conveys no
        intellectual-property rights in the underlying artwork beyond a personal, non-exclusive
        licence to display it, and no rights in the platform itself.
      </p>

      <h2>On-chain risk</h2>
      <p>
        Blockchains are experimental. Smart contracts can contain defects, networks can halt or
        reorganise, gas markets can spike, and third-party wallets, bridges, and RPC providers can
        fail. Transactions are irreversible. You accept these risks, and you accept that a loss
        caused by them is not something we can undo.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not attack, probe, or overload the service; do not attempt to access accounts or data that
        are not yours; do not scrape or resell the service; do not use it to launder value or to
        evade sanctions; and do not misrepresent your relationship with {BRAND.name}. We may suspend
        access that breaches this section.
      </p>

      <h2>Availability and changes</h2>
      <p>
        The platform is provided as-is and as-available, without warranties of any kind. We may
        change, suspend, or discontinue any part of it, including reward parameters and the reward
        ledger itself. To the fullest extent the law allows, we are not liable for indirect,
        incidental, or consequential loss, or for lost profits, lost tokens, or lost opportunity.
      </p>

      <h2>Updates to these terms</h2>
      <p>
        We may revise these terms. Material changes will be surfaced in the app before they take
        effect, and continuing to use the platform after that point means you accept the revision.
      </p>

      <p>
        Questions about anything above belong on the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </StaticPageShell>
  );
}
