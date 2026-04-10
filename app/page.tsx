import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { CommunityPulseSection } from "@/components/sections/CommunityPulseSection";
import { PersonasSection } from "@/components/sections/PersonasSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { MissionSection } from "@/components/sections/MissionSection";
import { CTASection } from "@/components/sections/CTASection";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <CommunityPulseSection />
        <PersonasSection />
        <EventsSection />
        <MissionSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
