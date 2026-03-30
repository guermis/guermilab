import { useVideos, useAlbums } from '@/hooks/useSupabaseData';
import { StreamingRow } from './StreamingRow';
import type { VideoItem, Album } from '@/hooks/useSupabaseData';
import { PROJECTS } from '@/data/projects';
import type { Project } from '@/types/project';

interface ProjectGridProps {
  activeCategory?: string | null;
  onVideoClick?: (project: Project) => void;
  onAlbumClick?: (album: Album) => void;
}

function videosToProjects(videos: VideoItem[], type: 'vertical' | 'horizontal'): Project[] {
  return videos.map((v, i) => ({
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

// Pad with duplicates for carousel testing
function padItems<T extends { id: string }>(items: T[], min: number): T[] {
  if (items.length === 0) return [];
  const result = [...items];
  let idx = 0;
  while (result.length < min) {
    result.push({ ...items[idx % items.length], id: `${items[idx % items.length].id}-dup-${result.length}` });
    idx++;
  }
  return result;
}

export function ProjectGrid({ activeCategory = null, onVideoClick, onAlbumClick }: ProjectGridProps) {
  const { data: verticalVideos } = useVideos('vertical');
  const { data: horizontalVideos } = useVideos('horizontal');
  const { data: albums } = useAlbums();

  // Use DB data, fallback to hardcoded for demo
  const verticalProjects = verticalVideos.length > 0
    ? videosToProjects(verticalVideos, 'vertical')
    : PROJECTS.filter((_, i) => i % 3 === 0).map(p => ({ ...p, category: 'Vertical' }));

  const horizontalProjects = horizontalVideos.length > 0
    ? videosToProjects(horizontalVideos, 'horizontal')
    : PROJECTS.filter((_, i) => i % 3 === 1).map(p => ({ ...p, category: 'Horizontal' }));

  const albumProjects = albums.length > 0
    ? albumsToProjects(albums)
    : PROJECTS.filter((_, i) => i % 3 === 2).map(p => ({ ...p, category: 'Fotografia' }));

  const sections = [
    { key: 'vertical', title: 'Vertical', aspect: '9:16' as const, projects: padItems(verticalProjects, 8), isPhotography: false },
    { key: 'horizontal', title: 'Horizontal', aspect: '16:9' as const, projects: padItems(horizontalProjects, 8), isPhotography: false },
    { key: 'fotografia', title: 'Fotografia', aspect: '3:4' as const, projects: padItems(albumProjects, 8), isPhotography: true },
  ];

  const filtered = activeCategory
    ? sections.filter(s => s.title === activeCategory)
    : sections;

  const visible = filtered.filter(s => s.projects.length > 0);

  if (visible.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-muted-foreground">Nenhum projeto encontrado.</p>
      </div>
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
              const album = albums.find(a => a.id === project.id) || 
                { id: project.id, title: project.title, cover_image_url: project.thumbnail, sort_order: 0 };
              onAlbumClick(album);
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
