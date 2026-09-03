import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { Card } from "@/components/ui/card";

export function StaticPageShell(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      <div className="hero-gradient w-full pb-0 relative">
        <LandingNavbar />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10 sm:py-12">
        <Card className="border-2 border-dashboard-border bg-white rounded-2xl p-6 sm:p-10 card-playful">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-claw-charcoal tracking-tight">{props.title}</h1>
          <div className="mt-6 text-sm sm:text-base text-claw-gray-600 leading-relaxed space-y-4">
            {props.children}
          </div>
        </Card>
      </main>

      <LandingFooter />
    </div>
  );
}
