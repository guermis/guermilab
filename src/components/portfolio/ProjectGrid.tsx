import { useState, useMemo } from 'react';
import { PROJECTS, getAllTags } from '@/data/projects';
import { StreamingRow } from './StreamingRow';

interface ProjectGridProps {
  activeCategory?: string | null;
}

export function ProjectGrid({ activeCategory = null }: ProjectGridProps) {
  // Group projects by category
  const categorized = useMemo(() => {
    const map = new Map<string, typeof PROJECTS>();
    const source = activeCategory
      ? PROJECTS.filter(p => p.category === activeCategory)
      : PROJECTS;

    source.forEach(p => {
      const list = map.get(p.category) || [];
      list.push(p);
      map.set(p.category, list);
    });
    return Array.from(map.entries());
  }, [activeCategory]);

  if (categorized.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-muted-foreground font-body">
          Nenhum projeto encontrado.
        </p>
      </div>
    );
  }

  return (
    <section id="work" className="py-8">
      {categorized.map(([category, projects]) => (
        <StreamingRow key={category} title={category} projects={projects} />
      ))}
    </section>
  );
}

// Re-export for backward compatibility
export { getAllTags };
