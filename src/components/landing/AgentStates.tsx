import { Section, Reveal } from "./Section";
import { agentStates } from "@/lib/brand";

/* =====================================================================
   03 — The three states.

   The illustration already teaches this section, so the layout gets out
   of its way: the art runs full width, and the three cards sit directly
   beneath it in the same left-to-right order as the robots in the frame.
   Reading the row twice — once as picture, once as text — is the whole
   design.
   ===================================================================== */

const STATES = [
  {
    name: "Fading",
    range: "Below 30",
    tone: "text-state-fading",
    dot: "bg-state-fading",
    body: "Power is draining and the community gets warned. Left alone, the agent goes offline.",
  },
  {
    name: "Idle",
    range: "30 – 79",
    tone: "text-state-idle",
    dot: "bg-state-idle",
    body: "Stable but unremarkable. Standard earn rate, no multiplier, no aura.",
  },
  {
    name: "Thriving",
    range: "80 and above",
    tone: "text-state-thriving",
    dot: "bg-state-thriving",
    body: "Full staking multiplier and a visible aura. This is what a well-tended agent looks like.",
  },
];

const AgentStates = () => (
  <Section
    id="agents"
    index="03"
    eyebrow="Agent States"
    tone="cream"
    title={
      <>
        Health you can read
        <br className="hidden sm:block" /> from across the room.
      </>
    }
    intro={
      <>
        Vitality is a single number from 0 to 100, and every agent wears it. No dashboard
        archaeology, no guessing which agent is about to go quiet.
      </>
    }
  >
    <Reveal>
      <figure className="overflow-hidden rounded-[1.25rem] border-2 border-ink bg-sky shadow-ink-lg">
        <img
          src={agentStates}
          alt="Three companion robots side by side — fading, idle and thriving — each with a segmented power meter beneath it"
          loading="lazy"
          className="block h-auto w-full"
          width={1280}
          height={853}
        />
      </figure>
    </Reveal>

    <div className="mt-fib4 grid gap-fib3 md:grid-cols-3">
      {STATES.map((s, i) => (
        <Reveal key={s.name} delay={i * 0.08}>
          <article className="ink-card ink-raise h-full p-fib3">
            <div className="flex items-center gap-fib2">
              <span className={`h-2.5 w-2.5 rounded-full border border-ink ${s.dot}`} aria-hidden />
              <h3 className={`font-display text-d1 ${s.tone}`}>{s.name}</h3>
            </div>
            <div className="label-mono mt-fib2 text-claw-gray-600">Vitality {s.range}</div>
            <p className="mt-fib2 text-label leading-relaxed text-claw-gray-600">{s.body}</p>
          </article>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default AgentStates;
