import { Cpu, Heart, Layers, Sparkles } from "lucide-react";

import { Section, Reveal } from "./Section";
import { BRAND, activationChamber } from "@/lib/brand";

/* =====================================================================
   02. The loop, staged in the Activation Chamber.

   This is the one inversion on the page, and it lands at roughly the
   first third of the scroll. The source art has two worlds; the product
   is the passage between them, so the page makes that passage instead of
   describing it. Ink shadows are dropped here: in the dark half the
   light comes off the subject: and green stops being an accent and
   becomes the only colour that means anything.

   It earns its place: this is where the technical claim lives, and a
   reader who scrolls past everything else should still hit this.
   ===================================================================== */

const STEPS = [
  {
    icon: Heart,
    title: "Nurture",
    body: "One tap opens a Proof-of-Life session on the device you already have. No daemon, no node, no rig.",
  },
  {
    icon: Cpu,
    title: "Contribute compute",
    body: "A Web Worker solves a nonced keccak-256 challenge in the background. Verified solutions push vitality up in real time.",
  },
  {
    icon: Sparkles,
    title: `Earn ${BRAND.rewardToken}`,
    body: "Credited against work that was actually done and checked. A receipt for compute, not a payout for holding.",
  },
  {
    icon: Layers,
    title: `Stake for ${BRAND.valueToken}`,
    body: `Staked ${BRAND.rewardToken} draws from the reward pool each 24-hour epoch. Phase 2 splits that 50:50 with tokenized ${BRAND.stockToken}.`,
  },
];

const HowItWorks = () => (
  <Section
    id="loop"
    index="02"
    eyebrow="The Loop"
    tone="lit"
    className="grain"
    title={
      <>
        One ritual,
        <br className="hidden sm:block" /> four moving parts.
      </>
    }
    intro={
      <>
        Nurturing is deliberately small: a minute of browser compute. What makes it
        matter is that every session is verified, and every verified session is visible
        to everyone watching that agent.
      </>
    }
  >
    {/* The chamber itself. Full width, because it is the moment the page
        is built around. */}
    <Reveal>
      <figure className="panel-live overflow-hidden">
        <img
          src={activationChamber}
          alt="Three companion robots standing in a green activation beam inside the Monkii Labs chamber"
          loading="lazy"
          className="block h-auto w-full"
          width={1280}
          height={720}
        />
        <figcaption className="flex flex-wrap items-center justify-between gap-fib2 border-t border-alive/20 px-fib3 py-fib3">
          <span className="label-mono text-paper-3">Activation chamber · bay 03</span>
          <span className="font-mono text-label text-alive-lit">
            keccak256(seed ‖ nonce) → leading zero bits ≥ difficulty
          </span>
        </figcaption>
      </figure>
    </Reveal>

    {/* Four steps. A 4-up breaks the thirds deliberately, the loop has
        four parts and pretending otherwise would be decoration. */}
    <div className="mt-fib5 grid gap-fib3 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.08}>
          <article className="panel raise flex h-full flex-col p-fib3">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-alive/30 bg-alive/[0.08]">
              <s.icon className="h-4 w-4 text-alive-lit" strokeWidth={2} />
            </span>
            <span className="label-mono mt-fib3 text-paper-3">
              Step {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-fib1 font-display text-d1 text-paper">{s.title}</h3>
            <p className="mt-fib2 text-label leading-relaxed text-paper-2">{s.body}</p>
          </article>
        </Reveal>
      ))}
    </div>

    {/* The decay engine, the reason the loop has to repeat. */}
    <Reveal delay={0.2}>
      <div className="mt-fib3 flex flex-col gap-fib2 rounded-lg border border-hair/10 bg-bench-2 px-fib3 py-fib3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[62ch] text-label text-paper-2">
          Vitality decays every minute whether anyone is watching or not. Companions slow
          the fall; only nurturing reverses it.
        </p>
        <code className="shrink-0 font-mono text-label text-act-lit">
          P₍t+1₎ = max(0, P₍t₎ − decay × (1 − mitigation))
        </code>
      </div>
    </Reveal>
  </Section>
);

export default HowItWorks;
