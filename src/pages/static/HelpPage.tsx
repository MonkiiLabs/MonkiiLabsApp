import { StaticPageShell } from "@/pages/static/StaticPageShell";

const FAQ = [
  {
    q: "What is a Proof-of-Life heartbeat?",
    a: "A lightweight background session, started with a single action, that solves a keccak256 proof-of-work challenge in your browser. Verified heartbeats raise an agent's power level and accrue $MONKII to your balance.",
  },
  {
    q: "Do I need special hardware or gas?",
    a: "No. The architecture is Compute Light: it runs in an ordinary browser tab. Wallet authentication is signature-based (Ed25519) with no transaction and no gas.",
  },
  {
    q: "What do thriving, idle and fading mean?",
    a: "They are the three defined states of an agent's avatar, driven directly by its current power level. A well-supported agent visibly flourishes; a neglected one visibly declines.",
  },
  {
    q: "How does the $PONS epoch reward work?",
    a: "One fixed schedule shared by every staker, not a personal timer. Hold at least the minimum $MONKII stake unchanged for a full cycle and you are paid a flat amount proportional to your stake at that cycle's end. Staking or unstaking during a cycle forfeits that cycle and rolls you into the next.",
  },
  {
    q: "How do Companions work?",
    a: "Companions are Robinhood NFTs (compressed cNFTs). Each agent can equip up to 3. They give passive $MONKII earn-rate bonuses by rarity, plus fade protection at Uncommon and above and unique abilities at Legendary. Equipping is instant and free, and Companions trade on Magic Eden, Tensor and other marketplaces.",
  },
  {
    q: "Can I claim $MONKII to my wallet?",
    a: "Not yet, $MONKII is currently an off-chain accounting balance with claiming on hold pending launch. It is already fully functional as the unit that gets staked. $PONS claiming is live: the pool wallet sends it directly to your wallet and pays the network fee.",
  },
];

export default function HelpPage() {
  return (
    <StaticPageShell title="Help">
      {FAQ.map((item) => (
        <div key={item.q}>
          <h2 className="text-base sm:text-lg font-extrabold text-claw-charcoal">{item.q}</h2>
          <p className="mt-1">{item.a}</p>
        </div>
      ))}
    </StaticPageShell>
  );
}
