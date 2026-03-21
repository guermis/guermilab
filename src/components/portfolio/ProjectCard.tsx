import { useState, useRef, useCallback } from 'react';
import { useInView } from '@/hooks/useInView';
import { Play } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  category: string;
  year: string;
  image: string;
  index: number;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

export function ProjectCard({ title, category, year, image, index, aspectRatio = 'landscape' }: ProjectCardProps) {
  const { ref, isInView } = useInView();
  const [isHovered, setIsHovered] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const aspectClasses = {
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    square: 'aspect-square',
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setScrubProgress(progress);
  }, []);

  // Generate simulated "scrub" effect with CSS filter shifts based on mouse position
  const scrubFilter = isHovered
    ? `brightness(${0.9 + scrubProgress * 0.3}) contrast(${1 + scrubProgress * 0.15}) saturate(${0.8 + scrubProgress * 0.4})`
    : undefined;
  const scrubTransform = isHovered
    ? `scale(${1.03 + scrubProgress * 0.02}) translateX(${(scrubProgress - 0.5) * -6}px)`
    : 'scale(1)';

  return (
    <div
      ref={ref}
      className={`group ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div
        ref={containerRef}
        data-cursor="play"
        data-cursor-label="Play"
        className={`relative overflow-hidden rounded-sm ${aspectClasses[aspectRatio]}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setScrubProgress(0); }}
        onMouseMove={handleMouseMove}
      >
        {/* Image with scrub effect */}
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover"
          style={{
            transform: scrubTransform,
            filter: scrubFilter,
            transition: isHovered
              ? 'filter 0.1s ease-out, transform 0.4s cubic-bezier(0.16,1,0.3,1)'
              : 'filter 0.5s ease-out, transform 0.7s ease-out',
          }}
        />

        {/* Scrub progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-primary transition-opacity duration-300"
          style={{
            width: `${scrubProgress * 100}%`,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Vignette on hover */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: isHovered
              ? 'radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.5) 100%)'
              : 'none',
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="rounded-sm bg-background/80 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body">
            {category}
          </span>
        </div>

        {/* Play icon - mobile fallback */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 md:hidden ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-primary/20">
            <Play className="h-4 w-4 text-primary ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="font-display text-base md:text-lg text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground font-body">{year}</span>
      </div>
    </div>
  );
}
