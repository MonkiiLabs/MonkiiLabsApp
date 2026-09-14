import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Heart } from "lucide-react";

import { monkiiMark, BRAND } from "@/lib/brand";
import CloudField from "@/components/CloudField";

/** An agent that has gone dark, the product's own vocabulary for a 404. */
const NotFound = () => {
  const { t } = useTranslation();

  return (
  <main className="hero-gradient relative flex min-h-screen items-center justify-center px-fib3 py-fib6">
    <CloudField />
    <div className="panel w-full max-w-md p-fib5 text-center">
      <img
        src={monkiiMark}
        alt=""
        aria-hidden
        className="mx-auto h-16 w-16 animate-bounce-gentle rounded-2xl object-cover shadow-playful"
      />
      <p className="label-mono mt-fib3 text-act-lit">{t("notFound.error")}</p>
      <h1 className="mt-fib2 font-display text-d3 text-paper">{t("notFound.title")}</h1>
      <p className="mx-auto mt-fib3 max-w-[38ch] text-label text-paper-2">
        {t("notFound.body")}
      </p>

      <div className="mt-fib4 flex flex-wrap justify-center gap-fib2">
        <Link
          to="/dashboard/agents"
          className="act inline-flex h-10 items-center gap-2 px-fib4 text-label font-semibold"
        >
          <Heart className="h-4 w-4 animate-heartbeat" strokeWidth={2} />
          {t("notFound.findAgent")}
        </Link>
        <Link
          to="/"
          className="act-quiet inline-flex h-10 items-center gap-2 px-fib4 text-label font-semibold"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          {t("notFound.home")}
        </Link>
      </div>

      <p className="label-mono mt-fib4 text-paper-4">{BRAND.name}</p>
    </div>
    </main>
  );
};

export default NotFound;
