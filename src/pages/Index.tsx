import { HeroSection } from '@/components/portfolio/HeroSection';
import { ProjectGrid } from '@/components/portfolio/ProjectGrid';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { ContactSection } from '@/components/portfolio/ContactSection';

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <ProjectGrid />
      <AboutSection />
      <ContactSection />
    </main>
  );
};

export default Index;
