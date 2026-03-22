import { HeroSection } from '@/components/portfolio/HeroSection';
import { ProjectGrid } from '@/components/portfolio/ProjectGrid';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { ContactSection } from '@/components/portfolio/ContactSection';
import { DynamicCTA } from '@/components/portfolio/DynamicCTA';
import { useAnalytics } from '@/hooks/useAnalytics';

const Index = () => {
  useAnalytics();

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <ProjectGrid />
      <AboutSection />
      <ContactSection />
      <DynamicCTA />
    </main>
  );
};

export default Index;
