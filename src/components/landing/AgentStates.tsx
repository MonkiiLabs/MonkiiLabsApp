import { useTranslation } from "react-i18next";

import { Section, Reveal } from "./Section";
import { AGENT_STATE_META, AGENTS, stateForPower } from "@/features/monkii/data";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/* AGENT_STATE_META still supplies the palette and emoji; only the words the
   reader sees come from the locale bundle. */
const STATES = (["thriving", "idle", "fading"] as const).map((key) => ({ key, ...AGENT_STATE_META[key] }));

const AgentStates = () => {
  const { t } = useTranslation();

  return (
  <Section
    id="agents"
    eyebrow={t("agentStates.eyebrow")}
    title={t("agentStates.title")}
    intro={t("agentStates.intro")}
  >
    <div className="grid gap-4 sm:gap-5 md:grid-cols-3 mb-10">
      {STATES.map((s, i) => (
        <Reveal key={s.key} delay={i * 0.08}>
          <article className={`h-full rounded-3xl border-2 border-dashboard-border p-6 bg-white card-playful ring-4 ${s.ring}`}>
            <div className={`w-16 h-16 rounded-2xl ${s.bg} flex items-center justify-center text-3xl mb-4`}>
              {s.emoji}
            </div>
            <h3 className={`text-lg font-extrabold mb-2 ${s.text}`}>
              {t(`agentStates.states.${s.key}.label`)}
            </h3>
            <p className="text-sm text-claw-gray-600 leading-relaxed">
              {t(`agentStates.states.${s.key}.note`)}
            </p>
          </article>
        </Reveal>
      ))}
    </div>

    <Reveal delay={0.1}>
      <div className="bg-cream rounded-3xl border-2 border-dashboard-border p-5 sm:p-7">
        <h3 className="text-base sm:text-lg font-extrabold text-claw-charcoal mb-4">
          {t("agentStates.liveTitle")}
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {AGENTS.slice(0, 4).map((agent) => {
            const meta = AGENT_STATE_META[stateForPower(agent.power)];
            return (
              <li
                key={agent.id}
                className="flex items-center gap-3 bg-white rounded-2xl border-2 border-dashboard-border p-3"
              >
                <div className="w-11 h-11 shrink-0 rounded-xl bg-cream border-2 border-dashboard-border flex items-center justify-center text-xl">
                  {agent.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-claw-charcoal truncate">{agent.name}</p>
                  <p className="text-xs text-claw-gray-600 truncate">{agent.tagline}</p>
                </div>
                <span className={`shrink-0 text-xs font-extrabold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                  {agent.power}%
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-5">
          <Button asChild className="rounded-full bg-coral hover:bg-coral-dark text-white font-bold shadow-coral">
            <Link to="/dashboard/agents">{t("common.openMarketplace")}</Link>
          </Button>
        </div>
      </div>
    </Reveal>
    </Section>
  );
};

export default AgentStates;
