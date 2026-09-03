import { StaticPageShell } from "@/pages/static/StaticPageShell";

export default function PrivacyPage() {
  return (
    <StaticPageShell title="Privacy">
      <p>
        This is a placeholder privacy page so footer navigation works smoothly. Replace this text with
        your official policy before launch.
      </p>
      <p>
        MONKII LABS uses Robinhood wallet-signature authentication. We store your wallet address, your
        heartbeat and power-contribution history, your $MONKII accounting balance and stake state, and
        which Companions you have equipped. Your wallet address and nurturing statistics may be shown
        publicly on leaderboards and agent pages.
      </p>
      <p>
        Heartbeat sessions run locally in your browser; we receive only the resulting proof and its
        verification result, not the contents of your device.
      </p>
    </StaticPageShell>
  );
}
