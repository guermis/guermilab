import { useState, useMemo } from 'react';
import { StreamingHero } from '@/components/portfolio/StreamingHero';
import { ProjectGrid } from '@/components/portfolio/ProjectGrid';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { ContactSection } from '@/components/portfolio/ContactSection';
import { DynamicCTA } from '@/components/portfolio/DynamicCTA';
import { StreamingSidebar } from '@/components/portfolio/StreamingSidebar';
import { useAnalytics } from '@/hooks/useAnalytics';
import { PROJECTS } from '@/data/projects';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  useAnalytics();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const categories = useMemo(() => {
    const cats = new Set<string>();
    PROJECTS.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, []);

  const handleNavClick = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <StreamingSidebar
        activeCategory={activeCategory}
        categories={categories}
        onCategoryClick={setActiveCategory}
        onNavClick={handleNavClick}
      />

      <main className={`flex-1 min-h-screen ${isMobile ? 'px-4 pt-16' : 'ml-[220px] px-8 pt-6'}`}>
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
