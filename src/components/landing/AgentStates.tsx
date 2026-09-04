import { Section, Reveal } from "./Section";
import { VitalTrace } from "@/components/landing/VitalTrace";
import { agentStates } from "@/lib/brand";
import type { AgentState } from "@/features/api/types";

/* =====================================================================
   03. The three states.

   The illustration already teaches this section, so the layout gets out
   of its way: the art runs full width, and the three cards sit directly
   beneath it in the same left-to-right order as the robots in the frame.
   Reading the row twice: once as picture, once as text, is the whole
   design.

   Each card carries its own vitality trace, and the trace is the reading:
   fading is two weak complexes with long silences between them, thriving
   is four tall ones evenly spaced. The waveform is derived from the state
   rather than drawn per card, so the row is a scale you can see before
   you read a single number.
   ===================================================================== */

const STATES = [
  {
    key: "fading" as AgentState,
    name: "Fading",
    range: "Below 30",
    tone: "text-act-lit",
    dot: "bg-act-lit",
    body: "Power is draining and the community gets warned. Left alone, the agent goes offline.",
  },
  {
    key: "idle" as AgentState,
    name: "Idle",
    range: "30 to 79",
    tone: "text-idle",
    dot: "bg-idle",
    body: "Stable but unremarkable. Standard earn rate, no multiplier, no aura.",
  },
  {
    key: "thriving" as AgentState,
    name: "Thriving",
    range: "80 and above",
    tone: "text-alive-lit",
    dot: "bg-alive",
    body: "Full staking multiplier and a visible aura. This is what a well-tended agent looks like.",
  },
];

const AgentStates = () => (
  <Section
    id="agents"
    index="03"
    eyebrow="Agent States"
    tone="bench"
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
      <figure className="overflow-hidden rounded-xl border border-hair/10 bg-bench-2">
        <img
          src={agentStates}
          alt="Three companion robots side by side, fading, idle and thriving, each with a segmented power meter beneath it"
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
          <article className="panel raise h-full p-fib3">
            <div className="flex items-center gap-fib2">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
              <h3 className={`font-display text-d1 ${s.tone}`}>{s.name}</h3>
            </div>
            <div className="label-mono mt-fib2 text-paper-3">Vitality {s.range}</div>

            {/* The reading, in its own inset well. */}
            <div className="well mt-fib3 px-fib2 py-fib1">
              <VitalTrace
                variant="spark"
                state={s.key}
                live
                className="h-8 w-full"
              />
            </div>

            <p className="mt-fib3 text-label leading-relaxed text-paper-2">{s.body}</p>
          </article>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default AgentStates;
