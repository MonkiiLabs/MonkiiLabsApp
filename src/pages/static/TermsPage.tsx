import { StaticPageShell } from "@/pages/static/StaticPageShell";

export default function TermsPage() {
  return (
    <StaticPageShell title="Terms">
      <p>
        This is a placeholder terms page so footer navigation works smoothly. Replace this text with
        your official terms before launch.
      </p>
      <p>
        By using MONKII LABS you agree to follow the platform rules and applicable laws, and you are
        responsible for your wallet security and for any action taken with your wallet. $MONKII is a
        reward-accounting balance, not a promise of a future asset; $PONS payouts follow the
        published epoch schedule and the real balance held by the pool wallet.
      </p>
      <p>
        Companion NFTs are on-chain assets you own and may trade freely. Bonuses apply only while a
        Companion is equipped to an active agent you are nurturing, and bonus values may be tuned as
        the economy evolves.
      </p>
    </StaticPageShell>
  );
}
