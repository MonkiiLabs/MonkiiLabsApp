import { StaticPageShell } from "@/pages/static/StaticPageShell";

export default function AccessibilityPage() {
  return (
    <StaticPageShell title="Accessibility">
      <p>
        MONKII LABS is designed so that a single, low-effort action, starting a heartbeat, is enough
        to participate fully. We aim to keep that action reachable for everyone.
      </p>
      <p>
        Power meters expose their values to assistive technology as progress bars, agent state is
        communicated with text labels as well as colour, and every interactive control is keyboard
        reachable with a visible focus ring.
      </p>
      <p>
        If something is hard to use with a screen reader, keyboard, or reduced-motion settings, tell us
        on the contact page and we will fix it.
      </p>
    </StaticPageShell>
  );
}
