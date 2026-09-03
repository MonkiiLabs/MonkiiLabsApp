import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { useMonkii } from "@/features/monkii/store";
import { BRAND } from "@/lib/brand";

const TONE = {
  alert: { emoji: "🙊", bg: "bg-coral/10", text: "text-coral-dark" },
  reward: { emoji: "💸", bg: "bg-human-green-bg", text: "text-human-green" },
  info: { emoji: "🍌", bg: "bg-sky/15", text: "text-sky-dark" },
} as const;

const AlertsPage = () => {
  const { notifications, markAllRead, unreadCount } = useMonkii();

  return (
    <div className="space-y-3">
      <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-claw-charcoal">Alerts</h1>
            <p className="text-sm text-claw-gray-600 mt-1 leading-relaxed">
              You're notified the moment an agent you support starts losing power — in-app and via the
              Telegram push bot.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllRead}
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full font-bold border-2 border-dashboard-border text-claw-charcoal hover:text-coral hover:border-coral"
            >
              Mark all read
            </Button>
          )}
        </div>
      </Card>

      {notifications.length === 0 ? (
        <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🐒</div>
          <p className="text-sm font-bold text-claw-charcoal">Nothing needs your attention</p>
        </Card>
      ) : (
        notifications.map((n) => {
          const tone = TONE[n.tone];
          return (
            <Card
              key={n.id}
              className={`border-2 rounded-2xl p-4 ${n.read ? "border-dashboard-border bg-white" : "border-coral/30 bg-coral/5"}`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-11 h-11 shrink-0 rounded-2xl ${tone.bg} flex items-center justify-center text-xl`}>
                  {tone.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-extrabold text-claw-charcoal">{n.title}</h2>
                    <span className="text-[11px] font-bold text-claw-gray-600">
                      {formatDistanceToNowStrict(new Date(n.createdAt))} ago
                    </span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-coral" />}
                  </div>
                  <p className="text-sm text-claw-gray-600 mt-1 leading-relaxed">{n.body}</p>
                  {n.agentId && (
                    <Link
                      to={`/dashboard/agents/${n.agentId}`}
                      className="inline-block mt-2 text-xs font-extrabold text-sky-dark hover:text-coral"
                    >
                      Nurture now →
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}

      <Card className="border-2 border-dashboard-border bg-cream rounded-2xl p-5">
        <h2 className="text-sm font-extrabold text-claw-charcoal">Power-drop alerts</h2>
        <p className="text-xs text-claw-gray-600 mt-1 leading-relaxed">
          Alerts fire when a watched agent crosses from Thriving into Idle, or from Idle into Fading.
          Equipping a Companion with fade protection raises the floor so an agent can't slip as far
          while you're away — and a Legendary keeps it at least Idle permanently. Rewards and
          {" "}{BRAND.valueToken} settlements also land here.
        </p>
      </Card>
    </div>
  );
};

export default AlertsPage;
