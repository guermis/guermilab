import { lazy, Suspense, useState } from 'react';
import { StreamingHero } from '@/components/portfolio/StreamingHero';
import { DeferredSection } from '@/components/portfolio/DeferredSection';
import { StreamingSidebar } from '@/components/portfolio/StreamingSidebar';
import type { Project } from '@/types/project';
import type { Album } from '@/hooks/useSupabaseData';

const ProjectGrid = lazy(() => import('@/components/portfolio/ProjectGrid').then(m => ({ default: m.ProjectGrid })));
const AboutSection = lazy(() => import('@/components/portfolio/AboutSection').then(m => ({ default: m.AboutSection })));
const ContactSection = lazy(() => import('@/components/portfolio/ContactSection').then(m => ({ default: m.ContactSection })));
const VideoModal = lazy(() => import('@/components/portfolio/VideoModal').then(m => ({ default: m.VideoModal })));
const AlbumModal = lazy(() => import('@/components/portfolio/AlbumModal').then(m => ({ default: m.AlbumModal })));

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; videoUrl: string; title: string }>({
    isOpen: false, videoUrl: '', title: '',
  });
  const [albumModal, setAlbumModal] = useState<Album | null>(null);
  const [videoOpened, setVideoOpened] = useState(false);
  const [albumOpened, setAlbumOpened] = useState(false);

  const categories = ['Vertical', 'Horizontal', 'Fotografia'];

  const handleNavClick = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleVideoClick = (project: Project) => {
    setVideoOpened(true);
    const videoUrl = project.mainVideo || '';
    setVideoModal({ isOpen: true, videoUrl, title: project.title });
  };

  const handleAlbumClick = (album: Album) => {
    setAlbumOpened(true);
    setAlbumModal(album);
  };

  return (
    <div className="min-h-screen">
      <StreamingSidebar
        activeCategory={activeCategory}
        categories={categories}
        onCategoryClick={setActiveCategory}
        onNavClick={handleNavClick}
      />

      <main className="flex-1 min-h-screen relative z-[1] px-6 md:px-10 pt-18">
        <StreamingHero />
        <DeferredSection id="work" className="min-h-[480px]">
          <Suspense fallback={<div className="min-h-[480px]" aria-busy="true" />}>
            <ProjectGrid
          activeCategory={activeCategory}
          onVideoClick={handleVideoClick}
          onAlbumClick={handleAlbumClick}
            />
          </Suspense>
        </DeferredSection>
        <DeferredSection id="about" className="min-h-[400px]">
          <Suspense fallback={null}><AboutSection /></Suspense>
        </DeferredSection>
        <DeferredSection id="contact" className="min-h-[600px]">
          <Suspense fallback={null}><ContactSection /></Suspense>
        </DeferredSection>
      </main>

      <Suspense fallback={<div role="status" className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 text-foreground">Carregando…</div>}>
      {videoOpened && <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal(prev => ({ ...prev, isOpen: false }))}
        videoUrl={videoModal.videoUrl}
        title={videoModal.title}
      />}

      {albumOpened && <AlbumModal
        album={albumModal}
        onClose={() => setAlbumModal(null)}
      />}
      </Suspense>
    </div>
  );
};

export default Index;
