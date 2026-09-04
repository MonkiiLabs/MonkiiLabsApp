import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";

import { monkiiMark, BRAND } from "@/lib/brand";
import CloudField from "@/components/CloudField";

/** An agent that has gone dark, the product's own vocabulary for a 404. */
const NotFound = () => (
  <main className="hero-gradient relative flex min-h-screen items-center justify-center px-fib3 py-fib6">
    <CloudField />
    <div className="panel w-full max-w-md p-fib5 text-center">
      <img
        src={monkiiMark}
        alt=""
        aria-hidden
        className="mx-auto h-16 w-16 animate-bounce-gentle rounded-2xl object-cover shadow-playful"
      />
      <p className="label-mono mt-fib3 text-act-lit">Error 404</p>
      <h1 className="mt-fib2 font-display text-d3 text-paper">This one went dark.</h1>
      <p className="mx-auto mt-fib3 max-w-[38ch] text-label text-paper-2">
        Nothing is running at this address. It may have been moved, or it never existed, either
        way, there are agents that still need a heartbeat.
      </p>

      <div className="mt-fib4 flex flex-wrap justify-center gap-fib2">
        <Link
          to="/dashboard/agents"
          className="act inline-flex h-10 items-center gap-2 px-fib4 text-label font-semibold"
        >
          <Heart className="h-4 w-4 animate-heartbeat" strokeWidth={2} />
          Find an agent
        </Link>
        <Link
          to="/"
          className="act-quiet inline-flex h-10 items-center gap-2 px-fib4 text-label font-semibold"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Home
        </Link>
      </div>

      <p className="label-mono mt-fib4 text-paper-4">{BRAND.name}</p>
    </div>
  </main>
);

export default NotFound;
