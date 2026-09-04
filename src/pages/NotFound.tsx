import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";

import { monkiiMark, BRAND } from "@/lib/brand";

/** An agent that has gone dark — the product's own vocabulary for a 404. */
const NotFound = () => (
  <main className="hero-gradient flex min-h-screen items-center justify-center px-fib3 py-fib6">
    <div className="w-full max-w-md rounded-2xl border-2 border-ink bg-white p-fib5 text-center shadow-ink-lg">
      <img
        src={monkiiMark}
        alt=""
        aria-hidden
        className="mx-auto h-20 w-20 animate-decay rounded-full border-2 border-ink object-cover grayscale"
      />
      <p className="label-mono mt-fib3 text-coral">Error 404</p>
      <h1 className="mt-fib2 font-display text-d3 text-ink">This one went dark.</h1>
      <p className="mx-auto mt-fib3 max-w-[38ch] text-label text-claw-gray-600">
        Nothing is running at this address. It may have been moved, or it never existed — either
        way, there are agents that still need a heartbeat.
      </p>

      <div className="mt-fib4 flex flex-wrap justify-center gap-fib2">
        <Link
          to="/dashboard/agents"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral px-fib4 py-2 text-label font-bold uppercase tracking-[0.1em] text-white shadow-ink"
        >
          <Heart className="h-4 w-4 animate-heartbeat" strokeWidth={2.5} />
          Find an agent
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-fib4 py-2 text-label font-bold uppercase tracking-[0.1em] shadow-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Home
        </Link>
      </div>

      <p className="label-mono mt-fib4 text-claw-gray-400">{BRAND.name}</p>
    </div>
  </main>
);

export default NotFound;
