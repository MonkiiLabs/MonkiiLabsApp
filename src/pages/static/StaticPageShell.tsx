import type { ReactNode } from "react";

import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";

/**
 * The reading shell for policy and help pages. One column at a measure
 * of roughly 68 characters, on the bench, under the same rules as
 * everything else: nothing here is a card, because a legal page is a
 * document, not a dashboard.
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
    <div className="min-h-screen overflow-x-hidden bg-background">
      <LandingNavbar />

      <header className="lamp border-b border-hair/[0.07] bg-bench pb-fib5 pt-[7.5rem]">
        <div className="mx-auto w-full max-w-3xl px-fib3 sm:px-fib4">
          <div className="flex items-center gap-fib2">
            <span className="h-px w-fib4 bg-hair/15" aria-hidden />
            <span className="label-mono text-paper-3">{eyebrow}</span>
          </div>
          <h1 className="mt-fib3 font-display text-d3 text-paper sm:text-d4">{title}</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-fib3 py-fib6 sm:px-fib4">
        <div
          className="
            space-y-fib3 text-body text-paper-2
            [&_a]:font-semibold [&_a]:text-act-lit [&_a]:underline [&_a]:underline-offset-2
            [&_h2]:mt-fib5 [&_h2]:font-display [&_h2]:text-d1 [&_h2]:text-paper [&_h2]:sm:text-d2
            [&_h3]:mt-fib4 [&_h3]:font-display [&_h3]:text-d1 [&_h3]:text-paper
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
