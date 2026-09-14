import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CTA = () => {
  const { t } = useTranslation();

  return (
  <section className="w-full px-4 sm:px-6 py-16 sm:py-24 bg-cream">
    <motion.div
      className="max-w-4xl mx-auto rounded-3xl border-2 border-dashboard-border bg-white p-8 sm:p-14 text-center shadow-playful-lg"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-5xl sm:text-6xl mb-5"
        animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🐒
      </motion.div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-claw-charcoal mb-4">
        {t("cta.title")}
      </h2>
      <p className="text-sm sm:text-base md:text-lg text-claw-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
        {t("cta.body")}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          size="lg"
          className="rounded-full bg-coral hover:bg-coral-dark text-white font-bold px-8 py-6 shadow-coral"
          asChild
        >
          <Link to="/dashboard">{t("cta.primary")}</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="rounded-full border-2 border-sky bg-sky/10 text-sky-dark hover:bg-sky hover:text-white font-bold px-8 py-6"
          asChild
        >
          <Link to="/dashboard/companions">{t("cta.secondary")}</Link>
        </Button>
      </div>
      </motion.div>
    </section>
  );
};

export default CTA;
