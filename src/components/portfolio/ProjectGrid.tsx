import { useMemo } from 'react';
import { PROJECTS } from '@/data/projects';
import { StreamingRow } from './StreamingRow';
import type { Project } from '@/types/project';

interface ProjectGridProps {
  activeCategory?: string | null;
  onVideoClick?: (project: Project) => void;
}

function padSection(projects: Project[], minCount: number): Project[] {
  if (projects.length === 0) return [];
  const result = [...projects];
  let idx = 0;
  while (result.length < minCount) {
    const source = projects[idx % projects.length];
    result.push({
      ...source,
      id: `${source.id}-dup-${result.length}`,
      slug: source.slug,
    });
    idx++;
  }
  return result;
}

const SECTIONS = [
  { key: 'vertical', title: 'Vertical', aspect: '9:16' as const, isPhotography: false },
  { key: 'horizontal', title: 'Horizontal', aspect: '16:9' as const, isPhotography: false },
  { key: 'fotografia', title: 'Fotografia', aspect: '3:4' as const, isPhotography: true },
];

export function ProjectGrid({ activeCategory = null, onVideoClick }: ProjectGridProps) {
  const sections = useMemo(() => {
    const source = activeCategory
      ? PROJECTS.filter(p => {
          if (activeCategory === 'Vertical') return true;
          if (activeCategory === 'Horizontal') return true;
          if (activeCategory === 'Fotografia') return true;
          return p.category === activeCategory;
        })
      : PROJECTS;

    const vertical: Project[] = [];
    const horizontal: Project[] = [];
    const fotografia: Project[] = [];

    source.forEach((p, i) => {
      const bucket = i % 3;
      if (bucket === 0) vertical.push(p);
      else if (bucket === 1) horizontal.push(p);
      else fotografia.push(p);
    });

    const allSections = [
      { ...SECTIONS[0], projects: padSection(vertical, 8) },
      { ...SECTIONS[1], projects: padSection(horizontal, 8) },
      { ...SECTIONS[2], projects: padSection(fotografia, 8) },
    ].filter(s => s.projects.length > 0);

    if (activeCategory) {
      return allSections.filter(s => s.title === activeCategory);
    }

    return allSections;
  }, [activeCategory]);

  if (sections.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-muted-foreground">Nenhum projeto encontrado.</p>
      </div>
    );
  }

  return (
    <section id="work" className="py-8">
      {sections.map(({ key, title, aspect, projects, isPhotography }) => (
        <StreamingRow
          key={key}
          title={title}
          projects={projects}
          aspect={aspect}
          isPhotography={isPhotography}
          onCardClick={onVideoClick}
          rightLabel={isPhotography ? 'Todos os álbuns' : undefined}
        />
      ))}
    </section>
  );
}

export { getAllTags } from '@/data/projects';
