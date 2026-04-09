import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { CTASection } from "@/components/sections/CTASection";

/**
 * Root page — assembles all landing page sections.
 */
export default function Home() {
  return (
    <>
      {/* Skip to main content — accessibility */}
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
        <EventsSection />
        <CTASection />
      </main>

      <Footer />
    </>
  );
}
