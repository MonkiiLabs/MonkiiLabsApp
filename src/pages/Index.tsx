import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import Ticker from "@/components/landing/Ticker";
import WhatIs from "@/components/landing/WhatIs";
import HowItWorks from "@/components/landing/HowItWorks";
import AgentStates from "@/components/landing/AgentStates";
import CompanionsSection from "@/components/landing/CompanionsSection";
import Tokens from "@/components/landing/Tokens";
import Roadmap from "@/components/landing/Roadmap";
import CTA from "@/components/landing/CTA";
import LandingFooter from "@/components/landing/LandingFooter";

/**
 * The landing page, read top to bottom, is one argument in six moves:
 * agents die (01) → here is the ritual that keeps them alive (02) →
 * here is how you can see it working (03) → here is what you collect
 * (04) → here is what you earn (05) → here is what comes next (06).
 *
 * The ground alternates paper / chamber / cream / white deliberately.
 * The single dark section is the Activation Chamber at 02, which lands
 * around the first third of the scroll: the page applies the rule of
 * thirds to its own length, not just to its layouts.
 */
const Index = () => (
  <div className="min-h-screen overflow-x-hidden bg-background">
    <div className="relative">
      <LandingNavbar />
      <Hero />
    </div>

    <Ticker />

    <WhatIs />
    <HowItWorks />
    <AgentStates />
    <CompanionsSection />
    <Tokens />
    <Roadmap />
    <CTA />
    <LandingFooter />
  </div>
);

export default Index;
