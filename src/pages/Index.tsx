import { useState } from 'react';
import { StreamingHero } from '@/components/portfolio/StreamingHero';
import { ProjectGrid } from '@/components/portfolio/ProjectGrid';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { ContactSection } from '@/components/portfolio/ContactSection';
import { StreamingSidebar } from '@/components/portfolio/StreamingSidebar';
import { VideoModal } from '@/components/portfolio/VideoModal';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { Project } from '@/types/project';

const Index = () => {
  useAnalytics();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; videoUrl: string; title: string }>({
    isOpen: false,
    videoUrl: '',
    title: '',
  });

  const categories = ['Vertical', 'Horizontal', 'Fotografia'];

  const handleNavClick = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleVideoClick = (project: Project) => {
    // For photography, could navigate to album — for now open modal
    const videoUrl = project.mainVideo || '';
    setVideoModal({ isOpen: true, videoUrl, title: project.title });
  };

  return (
    <div className="min-h-screen bg-ambient">
      <StreamingSidebar
        activeCategory={activeCategory}
        categories={categories}
        onCategoryClick={setActiveCategory}
        onNavClick={handleNavClick}
      />

      <main className="flex-1 min-h-screen relative z-[1] px-6 md:px-10 pt-18">
        <StreamingHero />
        <ProjectGrid activeCategory={activeCategory} onVideoClick={handleVideoClick} />
        <AboutSection />
        <ContactSection />
      </main>

      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal(prev => ({ ...prev, isOpen: false }))}
        videoUrl={videoModal.videoUrl}
        title={videoModal.title}
      />
    </div>
  );
};

export default Index;
