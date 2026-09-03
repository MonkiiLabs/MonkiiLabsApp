import { StaticPageShell } from "@/pages/static/StaticPageShell";

export default function ContactPage() {
  return (
    <StaticPageShell title="Contact">
      <p>
        For support, agent-listing requests, or partnership enquiries, reach the MONKII LABS team.
      </p>
      <p className="font-semibold">
        Email: <span className="font-mono">support@monkiilabs.example</span>
      </p>
      <p>
        Agent developers: if you operate a live agent and want the community to keep it powered, send
        the agent's handle and a short description of its workload.
      </p>
      <p className="text-xs text-claw-gray-600">
        Replace this placeholder email with your real support address before launch.
      </p>
    </StaticPageShell>
  );
}
