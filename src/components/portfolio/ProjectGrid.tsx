import { useMemo } from 'react';
import { PROJECTS } from '@/data/projects';
import { StreamingRow } from './StreamingRow';
import type { Project } from '@/types/project';

interface ProjectGridProps {
  activeCategory?: string | null;
}

// Mock data generator — duplicates projects to simulate volume
function padSection(projects: Project[], minCount: number): Project[] {
  if (projects.length === 0) return [];
  const result = [...projects];
  let idx = 0;
  while (result.length < minCount) {
    const source = projects[idx % projects.length];
    result.push({
      ...source,
      id: `${source.id}-dup-${result.length}`,
      slug: source.slug, // keep slug so navigation works
    });
    idx++;
  }
  return result;
}

// Section definitions — fixed order
const SECTIONS = [
  { key: 'vertical', title: 'Vertical', aspect: '9:16' as const },
  { key: 'horizontal', title: 'Horizontal', aspect: '16:9' as const },
  { key: 'fotografia', title: 'Fotografia', aspect: '3:4' as const },
];

export function ProjectGrid({ activeCategory = null }: ProjectGridProps) {
  const sections = useMemo(() => {
    const source = activeCategory
      ? PROJECTS.filter(p => p.category === activeCategory)
      : PROJECTS;

    // Distribute projects across the 3 sections round-robin
    const vertical: Project[] = [];
    const horizontal: Project[] = [];
    const fotografia: Project[] = [];

    source.forEach((p, i) => {
      const bucket = i % 3;
      if (bucket === 0) vertical.push(p);
      else if (bucket === 1) horizontal.push(p);
      else fotografia.push(p);
    });

    return [
      { ...SECTIONS[0], projects: padSection(vertical, 8) },
      { ...SECTIONS[1], projects: padSection(horizontal, 8) },
      { ...SECTIONS[2], projects: padSection(fotografia, 8) },
    ].filter(s => s.projects.length > 0);
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
      {sections.map(({ key, title, aspect, projects }) => (
        <StreamingRow key={key} title={title} projects={projects} aspect={aspect} />
      ))}
    </section>
  );
}

// Re-export for backward compatibility
export { getAllTags } from '@/data/projects';
