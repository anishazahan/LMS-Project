import HomeSections from "@/components/landing/ModernHero";
import { FeaturedSections } from "@/components/public/featured-sections";
import { TestimonialsSection } from "@/components/public/testimonials-section";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <HomeSections />

      <FeaturedSections />

      <TestimonialsSection />
    </div>
  );
}
