import { HeroSection } from '@/components/portfolio/HeroSection';
import { ProjectGrid } from '@/components/portfolio/ProjectGrid';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { ContactSection } from '@/components/portfolio/ContactSection';
import { DynamicCTA } from '@/components/portfolio/DynamicCTA';
import { NetflixNav } from '@/components/portfolio/NetflixNav';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useActiveSection } from '@/hooks/useActiveSection';

const Index = () => {
  useAnalytics();
  const activeSection = useActiveSection();

  return (
    <main className="min-h-screen bg-background">
      <NetflixNav currentSection={activeSection} />
      <HeroSection />
      <ProjectGrid />
      <AboutSection />
      <ContactSection />
      <DynamicCTA />
    </main>
  );
};

export default Index;
