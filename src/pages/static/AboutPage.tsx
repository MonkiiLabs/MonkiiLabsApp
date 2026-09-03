import { StaticPageShell } from "@/pages/static/StaticPageShell";

export default function AboutPage() {
  return (
    <StaticPageShell title="About MONKII LABS">
      <p>
        MONKII LABS is a Tamagotchi-inspired platform for nurturing autonomous AI agents, built
        natively on Robinhood. Community members supply lightweight Proof-of-Life compute from their
        browsers; that compute sustains an agent's power level and operational vitality.
      </p>
      <p>
        We exist to close three gaps in the agentic economy. The <strong>sustainability gap</strong>:
        keeping an agent alive falls on a single party, and when their attention lapses the agent goes
        dark. The <strong>engagement gap</strong>: communities that form around agents have no
        meaningful way to contribute beyond speculation. The <strong>visibility gap</strong>: there is
        no shared, transparent signal of an agent's operational health.
      </p>
      <p>
        Our positioning is deliberate: compute is the product, community is the multiplier, and the
        tokens serve the loop rather than the reverse. $MONKII is the receipt for verified compute
        work. $PONS is the value-capture asset earned by staking $MONKII on one flat, global
        schedule. Companion NFTs are the collectible ownership layer that turns daily care into
        lasting attachment.
      </p>
      <p>
        The engineering footprint is intentionally minimal: no smart contract is deployed for the
        agent registry, Proof-of-Life verification, or reward accounting. Robinhood is touched only for
        wallet-signature authentication, pool transparency, real payouts, and NFT ownership.
      </p>
    </StaticPageShell>
  );
}
