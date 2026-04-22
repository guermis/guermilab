import { useVideos, useAlbums } from '@/hooks/useSupabaseData';
import { StreamingRow } from './StreamingRow';
import type { VideoItem, Album } from '@/hooks/useSupabaseData';
import type { Project } from '@/types/project';

interface ProjectGridProps {
  activeCategory?: string | null;
  onVideoClick?: (project: Project) => void;
  onAlbumClick?: (album: Album) => void;
}

function videosToProjects(videos: VideoItem[], type: 'vertical' | 'horizontal'): Project[] {
  return videos.map((v) => ({
    id: v.id,
    slug: v.id,
    title: v.title,
    shortDescription: '',
    longDescription: '',
    tags: [],
    year: '',
    category: type === 'vertical' ? 'Vertical' : 'Horizontal',
    thumbnail: v.thumbnail_url || '/placeholder.svg',
    heroImage: v.thumbnail_url || '/placeholder.svg',
    mainVideo: v.video_url || '',
    context: '',
    execution: '',
    result: '',
    blocks: [],
    client: v.client || undefined,
    duration: v.duration || undefined,
  }));
}

function albumsToProjects(albums: Album[]): Project[] {
  return albums.map((a) => ({
    id: a.id,
    slug: a.id,
    title: a.title,
    shortDescription: '',
    longDescription: '',
    tags: [],
    year: '',
    category: 'Fotografia',
    thumbnail: a.cover_image_url || '/placeholder.svg',
    heroImage: a.cover_image_url || '/placeholder.svg',
    context: '',
    execution: '',
    result: '',
    blocks: [],
  }));
}

export function ProjectGrid({ activeCategory = null, onVideoClick, onAlbumClick }: ProjectGridProps) {
  const { data: verticalVideos } = useVideos('vertical');
  const { data: horizontalVideos } = useVideos('horizontal');
  const { data: albums } = useAlbums();

  // Only render real DB data — no fallbacks, no duplicate padding.
  const sections = [
    {
      key: 'vertical',
      title: 'Vertical',
      aspect: '9:16' as const,
      projects: videosToProjects(verticalVideos, 'vertical'),
      isPhotography: false,
    },
    {
      key: 'horizontal',
      title: 'Horizontal',
      aspect: '16:9' as const,
      projects: videosToProjects(horizontalVideos, 'horizontal'),
      isPhotography: false,
    },
    {
      key: 'fotografia',
      title: 'Fotografia',
      aspect: '3:4' as const,
      projects: albumsToProjects(albums),
      isPhotography: true,
    },
  ];

  // Hide empty sections entirely (no empty rows / streaming panels).
  const filtered = activeCategory
    ? sections.filter(s => s.title === activeCategory)
    : sections;

  const visible = filtered.filter(s => s.projects.length > 0);

  if (visible.length === 0) {
    return (
      <section id="work" className="py-24 text-center">
        <p className="text-sm text-muted-foreground">Nenhum projeto disponível ainda.</p>
      </section>
    );
  }

  return (
    <section id="work" className="py-8">
      {visible.map(({ key, title, aspect, projects, isPhotography }) => (
        <StreamingRow
          key={key}
          title={title}
          projects={projects}
          aspect={aspect}
          isPhotography={isPhotography}
          onCardClick={(project) => {
            if (isPhotography && onAlbumClick) {
              const album = albums.find(a => a.id === project.id);
              if (album) onAlbumClick(album);
            } else if (onVideoClick) {
              onVideoClick(project);
            }
          }}
          rightLabel={isPhotography ? 'Todos os álbuns' : undefined}
        />
      ))}
    </section>
  );
}
