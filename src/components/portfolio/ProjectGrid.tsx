import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from '@/hooks/useInView';
import { PROJECTS, getAllTags } from '@/data/projects';
import { ProjectCard } from './ProjectCard';

export function ProjectGrid() {
  const { ref: headerRef, isInView: headerVisible } = useInView();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const navigate = useNavigate();
  const allTags = getAllTags();

  const filtered = activeTag
    ? PROJECTS.filter(p => p.tags.includes(activeTag))
    : PROJECTS;

  return (
    <section id="work" className="relative px-6 py-24 md:px-16 lg:px-24">
      {/* Section header */}
      <div ref={headerRef} className={`mb-10 ${headerVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        <span className="text-[10px] tracking-[0.3em] uppercase text-primary font-body">
          Portfolio
        </span>
        <h2 className="mt-2 font-display text-3xl md:text-5xl text-foreground">
          Trabalhos Selecionados
        </h2>
        <div
          className={`mt-4 h-[1px] bg-primary/40 ${headerVisible ? 'animate-reveal-line' : 'w-0'}`}
          style={{ maxWidth: '6rem' }}
        />
      </div>

      {/* Tag filter */}
      <div className={`mb-12 flex flex-wrap gap-2 ${headerVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-sm px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-body transition-all duration-300 border ${
            activeTag === null
              ? 'border-primary/50 bg-primary/15 text-primary'
              : 'border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:text-foreground'
          }`}
        >
          Todos
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`rounded-sm px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-body transition-all duration-300 border ${
              activeTag === tag
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project, i) => (
          <div key={project.id} onClick={() => navigate(`/projeto/${project.slug}`)} className="cursor-pointer">
            <ProjectCard
              title={project.title}
              category={project.category}
              year={project.year}
              image={project.thumbnail}
              index={i}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground font-body py-16">
          Nenhum projeto encontrado com essa tag.
        </p>
      )}
    </section>
  );
}
