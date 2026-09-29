"use client";

import LandingNav from "./LandingNav";
import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import ServicesSection from "./sections/ServicesSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import RoleAccessSection from "./sections/RoleAccessSection";
import StatsSection from "./sections/StatsSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FaqSection from "./sections/FaqSection";
import ContactSection from "./sections/ContactSection";
import CtaSection from "./sections/CtaSection";
import LandingFooter from "./LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <HowItWorksSection />
      <RoleAccessSection />
      <StatsSection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
