import { useState } from 'react';
import { StreamingHero } from '@/components/portfolio/StreamingHero';
import { ProjectGrid } from '@/components/portfolio/ProjectGrid';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { ContactSection } from '@/components/portfolio/ContactSection';
import { DynamicCTA } from '@/components/portfolio/DynamicCTA';
import { StreamingSidebar } from '@/components/portfolio/StreamingSidebar';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  useAnalytics();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Sections are now fixed: Vertical, Horizontal, Fotografia
  const categories = ['Vertical', 'Horizontal', 'Fotografia'];

  const handleNavClick = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-ambient">
      <StreamingSidebar
        activeCategory={activeCategory}
        categories={categories}
        onCategoryClick={setActiveCategory}
        onNavClick={handleNavClick}
      />

      <main className={`flex-1 min-h-screen relative z-[1] ${isMobile ? 'px-4 pt-18' : 'ml-[255px] px-10 pt-6'}`}>
        <StreamingHero />
        <ProjectGrid activeCategory={activeCategory} />
        <AboutSection />
        <ContactSection />
        <DynamicCTA />
      </main>
    </div>
  );
};

export default Index;
