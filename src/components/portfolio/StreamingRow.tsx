import { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StreamingCard } from './StreamingCard';
import type { Project } from '@/types/project';

interface StreamingRowProps {
  title: string;
  projects: Project[];
  aspect?: '16:9' | '9:16' | '3:4';
}

export function StreamingRow({ title, projects, aspect = '16:9' }: StreamingRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/row mb-14">
      {/* Row header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className="text-lg md:text-xl text-foreground font-semibold tracking-tight">{title}</h3>
        <span className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground/40 font-medium">
          {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
        </span>
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-16 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-500"
            style={{ background: 'linear-gradient(90deg, hsl(var(--background)), transparent)' }}
          >
            <div className="glass rounded-full p-2.5">
              <ChevronLeft className="h-4 w-4 text-foreground/80" />
            </div>
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-16 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-500"
            style={{ background: 'linear-gradient(270deg, hsl(var(--background)), transparent)' }}
          >
            <div className="glass rounded-full p-2.5">
              <ChevronRight className="h-4 w-4 text-foreground/80" />
            </div>
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide snap-x pb-2"
        >
          {projects.map((project, i) => (
            <StreamingCard
              key={project.id}
              slug={project.slug}
              title={project.title}
              category={project.category}
              year={project.year}
              thumbnail={project.thumbnail}
              duration={project.duration}
              aspect={aspect}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
