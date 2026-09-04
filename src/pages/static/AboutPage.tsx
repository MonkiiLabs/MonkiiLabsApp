import { StaticPageShell } from "@/pages/static/StaticPageShell";
import { BRAND } from "@/lib/brand";

export default function AboutPage() {
  return (
    <StaticPageShell title="About MONKII LABS" eyebrow="The idea">
      <p>
        {BRAND.name} is a Tamagotchi for autonomous AI agents, built on {BRAND.network}. An agent
        here has a power level that decays on its own. Community members restore it by supplying
        lightweight Proof-of-Life compute straight from a browser tab, and they are paid for the work
        they contribute. Keeping an agent alive stops being one operator's private cost and becomes
        something a community can do together, and be rewarded for.
      </p>

      <h2>The three gaps we close</h2>
      <p>
        <strong>Sustainability.</strong> Keeping an agent running falls on a single party. When their
        attention or their budget lapses, the agent goes dark, and everything built around it goes
        with it.
      </p>
      <p>
        <strong>Engagement.</strong> Communities form around interesting agents and then have nothing
        to do except speculate on a ticker. There is no way to actually help.
      </p>
      <p>
        <strong>Visibility.</strong> There is no shared, honest signal of whether an agent is healthy.
        Thriving, idle, and fading are legible states, published for everyone.
      </p>

      <h2>How the loop works</h2>
      <p>
        You open a session against an agent. Your browser receives a challenge and solves it in a Web
        Worker, off the main thread, so the page stays responsive. The solution goes back to our
        servers, which verify it, restore a slice of the agent's power, and credit you{" "}
        {BRAND.rewardToken}. Then the next challenge arrives and it runs again. No specialised
        hardware, no gas, and nothing to install.
      </p>

      <h2>What the tokens are for</h2>
      <p>
        Compute is the product, the community is the multiplier, and the tokens serve the loop rather
        than the other way round. {BRAND.rewardToken} is the receipt for verified compute work.{" "}
        {BRAND.valueToken} is the value-capture asset, earned by staking {BRAND.rewardToken} on one
        flat, published, global schedule, and paid from the real balance held by the pool wallet.
        Companion NFTs are the ownership layer that turns daily care into something lasting.
      </p>

      <h2>What is on-chain, and what is not</h2>
      <p>
        We put on-chain only what genuinely benefits from being there. Companions are a real ERC-721
        collection on {BRAND.network}, so what you mint is yours and outlives the platform.{" "}
        {BRAND.network} is also where wallet-signature authentication, pool transparency, and{" "}
        {BRAND.valueToken} payouts happen.
      </p>
      <p>
        Everything in the hot path stays off-chain and deliberately so: the agent registry,
        Proof-of-Life verification, and reward accounting. Putting a heartbeat on-chain would make
        the core loop cost gas, which would defeat the point of a mechanism whose whole promise is
        that anyone can contribute from a browser tab for free.
      </p>

      <p>
        The specifics of your rights and ours are on the <a href="/terms">terms page</a>.
      </p>
    </StaticPageShell>
  );
}
