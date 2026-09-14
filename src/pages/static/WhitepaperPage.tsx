import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { StaticPageShell } from "@/pages/static/StaticPageShell";
import { BRAND } from "@/lib/brand";
import {
  AGENT_POWER_MAX,
  CHAIN_ID,
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
 * The prose lives in the locale bundle under `wp.*`; the figures stay
 * here, because a number is the same in every language and a translator
 * should never be in a position to retype one.
 *
 * It reads on the same shell as the policy pages: one column, cream
 * paper, sky behind the masthead. A whitepaper is a document, so the only
 * things here that are not running text are the parameter tables, and
 * they are set as tables rather than dressed up as cards.
 */

const SECTIONS = [
  { id: "abstract", key: "abstract" },
  { id: "problem", key: "problem" },
  { id: "vitality", key: "vitality" },
  { id: "proof-of-life", key: "proofOfLife" },
  { id: "monkii", key: "monkii" },
  { id: "staking", key: "staking" },
  { id: "companions", key: "companions" },
  { id: "architecture", key: "architecture" },
  { id: "security", key: "security" },
  { id: "parameters", key: "parameters" },
  { id: "roadmap", key: "roadmap" },
  { id: "risks", key: "risks" },
] as const;

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
  const { t } = useTranslation();

  return (
    <div className="my-fib4 overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-label">
        <caption className="label-mono mb-fib2 text-left text-claw-gray-600">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-dashboard-border text-left">
            <th className="py-fib2 pr-fib3 font-extrabold text-claw-charcoal">
              {t("wp.table.parameter")}
            </th>
            <th className="py-fib2 pr-fib3 font-extrabold text-claw-charcoal">
              {t("wp.table.value")}
            </th>
            <th className="py-fib2 font-extrabold text-claw-charcoal">{t("wp.table.meaning")}</th>
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

/** A paragraph that opens with a bolded lead-in, used throughout the paper. */
function Lead({ label, body }: { label: string; body: string }) {
  return (
    <p>
      <strong>{label}</strong> {body}
    </p>
  );
}

export default function WhitepaperPage() {
  const { t } = useTranslation();

  return (
    <StaticPageShell title={t("wp.title")} eyebrow={t("wp.eyebrow")}>
      <p className="text-lead text-claw-charcoal">{t("wp.lead")}</p>

      {/* Contents. Numbered because the sections genuinely build on each
          other: vitality defines the problem Proof-of-Life solves, which
          defines what the token is a receipt for. */}
      <nav aria-label={t("wp.contents")} className="my-fib4 border-y-2 border-dashboard-border py-fib3">
        <h2 className="label-mono !mt-0 text-claw-gray-600">{t("wp.contents")}</h2>
        <ol className="!mt-fib2 !list-none !space-y-fib1 !pl-0 columns-1 sm:columns-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="!font-semibold !text-claw-charcoal !no-underline hover:!text-coral"
              >
                {t(`wp.nav.${s.key}`)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <H id="abstract">{t("wp.nav.abstract")}</H>
      <p>{t("wp.abstract1")}</p>
      <p>{t("wp.abstract2")}</p>
      <p>{t("wp.abstract3")}</p>

      <H id="problem">{t("wp.nav.problem")}</H>
      <Lead label={t("wp.sustainabilityLabel")} body={t("wp.sustainability")} />
      <Lead label={t("wp.engagementLabel")} body={t("wp.engagement")} />
      <Lead label={t("wp.visibilityLabel")} body={t("wp.visibility")} />

      <H id="vitality">{t("wp.nav.vitality")}</H>
      <p>{t("wp.vitality1", { max: AGENT_POWER_MAX })}</p>
      <p>{t("wp.vitality2")}</p>
      <p>{t("wp.vitality3")}</p>
      <ul>
        <li>
          <strong>{t("wp.thrivingLabel")}</strong>
          {t("wp.thriving")}
        </li>
        <li>
          <strong>{t("wp.idleLabel")}</strong>
          {t("wp.idle")}
        </li>
        <li>
          <strong>{t("wp.fadingLabel")}</strong>
          {t("wp.fading")}
        </li>
      </ul>
      <p>{t("wp.vitality4")}</p>

      <H id="proof-of-life">{t("wp.nav.proofOfLife")}</H>
      <p>
        {t("wp.pol1a")}
        <em>{t("wp.pol1em")}</em>
        {t("wp.pol1b")}
      </p>
      <p>{t("wp.polLoop")}</p>
      <ol>
        <li>{t("wp.polStep1")}</li>
        <li>
          {t("wp.polStep2a")} <code>keccak256(seed:nonce)</code> {t("wp.polStep2b")}{" "}
          <em>{t("wp.polStep2em")}</em> {t("wp.polStep2c")}
        </li>
        <li>{t("wp.polStep3")}</li>
        <li>{t("wp.polStep4", { max: AGENT_POWER_MAX })}</li>
        <li>{t("wp.polStep5")}</li>
      </ol>
      <p>{t("wp.polIntensity")}</p>

      <ParamTable
        caption={t("wp.accrualCaption")}
        rows={[
          [t("wp.accrualLight"), t("wp.accrualLightValue"), t("wp.accrualLightMeaning")],
          [t("wp.accrualStd"), t("wp.accrualStdValue"), t("wp.accrualStdMeaning")],
          [t("wp.accrualMax"), t("wp.accrualMaxValue"), t("wp.accrualMaxMeaning")],
        ]}
      />

      <p>{t("wp.polGuards")}</p>

      <H id="monkii">{t("wp.nav.monkii")}</H>
      <p>{t("wp.monki1")}</p>
      <p>{t("wp.monki2")}</p>
      <p>{t("wp.monki3")}</p>

      <H id="staking">{t("wp.nav.staking")}</H>
      <p>{t("wp.staking1")}</p>
      <p>{t("wp.staking2")}</p>
      <p>
        {t("wp.staking3a")}
        <em>{t("wp.staking3em")}</em>
        {t("wp.staking3b")}
      </p>
      <p>{t("wp.staking4")}</p>
      <Lead
        label={t("wp.phase2Label")}
        body={t("wp.phase2", { stockToken: BRAND.stockToken })}
      />

      <H id="companions">{t("wp.nav.companions")}</H>
      <p>{t("wp.comp1")}</p>
      <p>{t("wp.comp2")}</p>
      <p>{t("wp.comp3")}</p>
      <ul>
        <li>
          <strong>{t("wp.rarityCommon")}</strong>
          {t("wp.rarityCommonText")}
        </li>
        <li>
          <strong>{t("wp.rarityUncommon")}</strong>
          {t("wp.rarityUncommonText")}
        </li>
        <li>
          <strong>{t("wp.rarityRare")}</strong>
          {t("wp.rarityRareText")}
        </li>
        <li>
          <strong>{t("wp.rarityEpic")}</strong>
          {t("wp.rarityEpicText")}
        </li>
        <li>
          <strong>{t("wp.rarityLegendary")}</strong>
          {t("wp.rarityLegendaryText")}
        </li>
      </ul>
      <p>{t("wp.comp4")}</p>

      <H id="architecture">{t("wp.nav.architecture")}</H>
      <p>{t("wp.arch1")}</p>
      <p>
        <strong>{t("wp.archOnChainLabel")}</strong> {t("wp.archOnChain", { chainId: CHAIN_ID })}
      </p>
      <p>
        <strong>{t("wp.archOffChainLabel")}</strong>
        {t("wp.archOffChain")}
      </p>
      <p>
        {t("wp.archClientA")}{" "}
        <a href={explorerAddressUrl(PONS_TOKEN_ADDRESS)} target="_blank" rel="noreferrer">
          {t("wp.archTokenLink")}
        </a>{" "}
        {t("wp.archAnd")}{" "}
        <a href={explorerAddressUrl(COMPANION_NFT_ADDRESS)} target="_blank" rel="noreferrer">
          {t("wp.archCompanionsLink")}
        </a>
        .
      </p>

      <H id="security">{t("wp.nav.security")}</H>
      <Lead label={t("wp.secAuthLabel")} body={t("wp.secAuth")} />
      <Lead label={t("wp.secActionLabel")} body={t("wp.secAction")} />
      <Lead label={t("wp.secReplayLabel")} body={t("wp.secReplay")} />
      <Lead label={t("wp.secGateLabel")} body={t("wp.secGate")} />

      <H id="parameters">{t("wp.nav.parameters")}</H>
      <p>{t("wp.params1")}</p>

      <ParamTable
        caption={t("wp.polCaption")}
        rows={[
          [t("wp.pDifficulty"), "10 bits", t("wp.pDifficultyMeaning")],
          [t("wp.pLifetime"), "120 s", t("wp.pLifetimeMeaning")],
          [t("wp.pPower"), "10", t("wp.pPowerMeaning", { max: AGENT_POWER_MAX })],
          [t("wp.pEarn"), `5.0 ${BRAND.rewardToken}`, t("wp.pEarnMeaning")],
          [t("wp.pInterval"), "3 s", t("wp.pIntervalMeaning")],
          [t("wp.pEval"), "60 s", t("wp.pEvalMeaning")],
        ]}
      />

      <ParamTable
        caption={t("wp.stakeCaption")}
        rows={[
          [t("wp.pEpoch"), "24 h", t("wp.pEpochMeaning")],
          [t("wp.pMinStake"), `100 ${BRAND.rewardToken}`, t("wp.pMinStakeMeaning")],
          [t("wp.pYield"), `0.001 ${BRAND.valueToken}`, t("wp.pYieldMeaning")],
          [t("wp.pMultRange"), "1.0x - 3.0x", t("wp.pMultRangeMeaning")],
          [t("wp.pMaxMult"), `10,000 ${BRAND.rewardToken}`, t("wp.pMaxMultMeaning")],
          [t("wp.pPremium"), `1,000 ${BRAND.rewardToken}`, t("wp.pPremiumMeaning")],
        ]}
      />

      <ParamTable
        caption={t("wp.compCaption")}
        rows={[
          [t("wp.pSlots"), "3", t("wp.pSlotsMeaning")],
          [t("wp.pMintPrice"), t("wp.pMintPriceValue"), t("wp.pMintPriceMeaning")],
          [t("wp.pDecayCap"), "80%", t("wp.pDecayCapMeaning")],
        ]}
      />

      <H id="roadmap">{t("wp.nav.roadmap")}</H>
      <Lead label={t("wp.phase1Label")} body={t("wp.phase1")} />
      <Lead label={t("wp.phase2rLabel")} body={t("wp.phase2r")} />
      <Lead
        label={t("wp.phase3Label", { stockToken: BRAND.stockToken })}
        body={t("wp.phase3", { stockToken: BRAND.stockToken })}
      />
      <Lead label={t("wp.phase4Label")} body={t("wp.phase4")} />

      <H id="risks">{t("wp.nav.risks")}</H>
      <Lead label={t("wp.riskLedgerLabel")} body={t("wp.riskLedger")} />
      <Lead label={t("wp.riskPolLabel")} body={t("wp.riskPol")} />
      <Lead
        label={t("wp.riskPhase2Label")}
        body={t("wp.riskPhase2", { stockToken: BRAND.stockToken })}
      />
      <Lead label={t("wp.riskParamsLabel")} body={t("wp.riskParams")} />
      <p>
        <strong>{t("wp.riskAdviceLabel")}</strong> {t("wp.riskAdviceA")}{" "}
        <a href="/terms">{t("wp.riskAdviceLink")}</a>
        {t("wp.riskAdviceB")}
      </p>

      <p className="!mt-fib5 border-t-2 border-dashboard-border pt-fib3 text-label text-claw-gray-600">
        {t("wp.footerA")} <a href="/contact">{t("wp.footerLink")}</a>
        {t("wp.footerB")}
      </p>
    </StaticPageShell>
  );
}
