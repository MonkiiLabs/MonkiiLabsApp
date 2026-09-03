import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import WhatIs from "@/components/landing/WhatIs";
import AgentStates from "@/components/landing/AgentStates";
import HowItWorks from "@/components/landing/HowItWorks";
import CompanionsSection from "@/components/landing/CompanionsSection";
import Tokens from "@/components/landing/Tokens";
import Differentiators from "@/components/landing/Differentiators";
import Audience from "@/components/landing/Audience";
import Roadmap from "@/components/landing/Roadmap";
import CTA from "@/components/landing/CTA";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      <div className="min-h-0 sm:min-h-screen hero-gradient w-full pb-0 relative">
        <LandingNavbar />
        <Hero />
      </div>

      <WhatIs />
      <AgentStates />
      <HowItWorks />
      <CompanionsSection />
      <Tokens />
      <Differentiators />
      <Audience />
      <Roadmap />
      <CTA />
      <LandingFooter />
    </div>
  );
};

export default Index;
