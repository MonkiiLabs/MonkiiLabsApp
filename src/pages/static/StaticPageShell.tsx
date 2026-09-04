import type { ReactNode } from "react";

import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import CloudField from "@/components/CloudField";

/**
 * The reading shell for policy and help pages. One column at a measure
 * of roughly 68 characters on cream paper, with the same sky and clouds
 * behind the masthead as everywhere else. Nothing here is a card,
 * because a legal page is a document, not a dashboard.
 */
export function StaticPageShell({
  title,
  eyebrow = "Monkii Labs",
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    // The wrapper stays transparent: an opaque ground here would paint
    // over the negative-z cloud layer and hide it.
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-cream" />
      <CloudField />
      <LandingNavbar />

      <header className="hero-gradient relative pb-fib5 pt-[7.5rem]">
        <div className="mx-auto w-full max-w-3xl px-fib3 sm:px-fib4">
          <div className="flex items-center gap-fib2">
            <span className="h-0.5 w-fib4 rounded-full bg-coral" aria-hidden />
            <span className="label-mono text-claw-gray-600">{eyebrow}</span>
          </div>
          <h1 className="mt-fib3 font-extrabold text-d3 text-claw-charcoal sm:text-d4">{title}</h1>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-fib3 py-fib6 sm:px-fib4">
        <div
          className="
            space-y-fib3 text-body text-paper-2
            [&_a]:font-semibold [&_a]:text-act-lit [&_a]:underline [&_a]:underline-offset-2
            [&_h2]:mt-fib5 [&_h2]:font-extrabold [&_h2]:text-d1 [&_h2]:text-paper [&_h2]:sm:text-d2
            [&_h3]:mt-fib4 [&_h3]:font-extrabold [&_h3]:text-d1 [&_h3]:text-paper
            [&_li]:leading-relaxed
            [&_ol]:list-decimal [&_ol]:space-y-fib2 [&_ol]:pl-5
            [&_p]:leading-[1.618]
            [&_ul]:list-disc [&_ul]:space-y-fib2 [&_ul]:pl-5
          "
        >
          {children}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default StaticPageShell;
